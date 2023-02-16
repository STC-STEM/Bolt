import * as log4js from "log4js"
import axios from "axios"
import * as cheerio from 'cheerio'
import * as cron from 'node-cron'
import { ModuleBase } from "../common/module-base";
import { getRequiredService } from "../service";
import { Command, CommandService } from "../service/command";
import { MPCCron } from "../entity/mpc-cron";


const logger = log4js.getLogger()

const CACHE_DURATION = 15 * 60 * 1000
export class MPCModule extends ModuleBase {
    fetchCache!: string[][]
    lastUpdateTimeStamp: number = 0



    initialize(): void {
        getRequiredService(CommandService).register(new Command({
            names: ['mpc'],
            perms: ['mpc'],
            commandOption: {
                add: {
                    type: 'boolean',
                    alias: 'a',
                    default: false
                },
                remove: {
                    type: 'boolean',
                    alias: 'r',
                    default: false
                },
                list: {
                    type: 'boolean',
                    alias: 'l',
                    default: false
                }
            },
            command: async (msg, args) => {
                if (args.add) {
                    let currChat = (await msg.getChat()).id._serialized
                    let result = await MPCCron.findOneBy({
                        registeredChat: currChat
                    })
                    if (result != null) {
                        msg.reply('You have already registered this chat!')
                        return
                    }
                    await MPCCron.save(
                        MPCCron.create({registeredChat: currChat})
                    )
                    msg.reply('Registered!')
                    return
                }
                if (args.remove) {
                    let currChat = (await msg.getChat()).id._serialized
                    let result = await MPCCron.findOneBy({
                        registeredChat: currChat
                    })
                    if (result == null) {
                        msg.reply('This chat has not been registered yet!')
                        return
                    }
                    await MPCCron.remove(result)
                    msg.reply('Deregistered!')
                    return
                }
                if (args.list) {
                    let registeredChats = await MPCCron.find()
                    msg.reply(`Registered chats:\n${registeredChats.map(x => x.registeredChat).join('\n')}`)
                    return
                }

                try {
                    msg.reply(await this.getTodayMpcInfo())
                }
                catch (e) {
                    if (axios.isAxiosError(e)) {
                        logger.warn('MPCModule axios error,', e)
                    }
                    else
                        throw e
                }
            }
        }))

        cron.schedule('30 17 * * 1-5', async () => {
            try {
                let registeredChats = await MPCCron.find()
                for (let c of registeredChats) {
                    let chat = await this.mainModule.client.getChatById(c.registeredChat)
                    chat.sendMessage('麻煩同學記得簽通告同埋做mpc🙇🙇')
                    chat.sendMessage(await this.getTodayMpcInfo())
                }
            }
            catch (e) {
                logger.error('MPCModule schedule failed', e)
            }
        })
    }

    private async getTodayMpcInfo() {
        let mpcLinks = await this.getMpcData()
        let todayMpc = mpcLinks.at(-1)
        let lastMpc = mpcLinks.at(-2)
        let replyMsg: string

        if (todayMpc?.at(1) == undefined) {
           return 'No mpc??? Go to https://sites.google.com/stc.edu.hk/faith-ourite-corner/morning-prayer-challenge and check plz'
        }

        replyMsg = `Today's mpc link is ${todayMpc.at(1)} (${todayMpc.at(0)})`
        if (lastMpc?.at(1) == undefined)
            return replyMsg

        replyMsg += `\nLast time's mpc link is ${lastMpc.at(1)} (${lastMpc.at(0)})`
        return replyMsg
    }

    private async getMpcData() {
        if (Date.now() - this.lastUpdateTimeStamp > CACHE_DURATION) {
            this.lastUpdateTimeStamp = Date.now()
            let res = await axios.get('https://sites.google.com/stc.edu.hk/faith-ourite-corner/morning-prayer-challenge', {
                headers: {'Accept-Encoding': 'identity'}
            })
            let $ = cheerio.load(res.data)
            this.fetchCache = $('a').get()
                .filter(x => x.attribs['href']?.startsWith('https://forms.gle'))
                .map(x => [$(x).find('span').text(), x.attribs['href']])
            return this.fetchCache
        }
        else
            return this.fetchCache
    }
}
