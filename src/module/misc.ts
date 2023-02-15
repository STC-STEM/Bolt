import * as log4js from "log4js"
import { ModuleBase } from "../common/module-base"
import { getRequiredService } from "../service"
import { Command, CommandService } from "../service/command"

const logger = log4js.getLogger()

export class MiscModule extends ModuleBase {
    commandService!: CommandService

    initialize(): void {
        this.commandService = getRequiredService(CommandService)
        this.commandService.register(new Command({
            names: ['version'],
            perms: [],
            commandOption: {},
            command: async (msg, args) => {
                msg.reply('Bolt is a very simple WhatsApp BOT!\nCurrent version: v0.0.1')
            }
        }))
        this.commandService.register(new Command({
            names: ['calcgaeness'],
            perms: [],
            commandOption: {},
            command: async (msg, args) => {
                if (args._.length > 0) {
                    msg.reply(`The gaeness of ${args._.join(' ')} is ${Math.floor(Math.random() * 101)}%`)
                }
            }
        }))
        this.commandService.register(new Command({
            names: ['random'],
            perms: [],
            commandOption: {},
            command: async (msg, args) => {
                if (args._.length < 2 || args._.length > 3) {
                    msg.reply('usage: /random <start> <end> [count]')
                    return
                }
                if (args._.some(x => typeof x !== 'number')) {
                    msg.reply('num plz😰')
                    return
                }
                let start = (args._.at(0) as unknown as number)
                let end = (args._.at(1) as unknown as number)
                let count = (args._.at(2) as unknown as number)
                if (start > end) {
                    msg.reply('end should be > than start')
                    return
                }
                if (count != undefined && count < 1) {
                    msg.reply('count should be > than 0')
                    return
                }
                if (count == undefined) {
                    msg.reply(`${start + Math.floor(Math.random() * (end - start + 1))}`)
                }
                else {
                    let arr = new Array<number>(count)
                    for (let i = 0; i < arr.length; i++) {
                        arr[i] = start + Math.floor(Math.random() * (end - start + 1))
                    }
                    msg.reply(`${arr.join('\n')}`)
                }
            }
        }))
        this.commandService.register(new Command({
            names: ['sudo'],
            perms: ['admin.sudo'],
            commandOption: {},
            command:async (msg, args) => {
                this.commandService.invoke(msg, msg.body.split(' ').slice(1).join(' '), true)
            }
        }))
    }
}