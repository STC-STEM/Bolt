import * as log4js from "log4js"
import { ModuleBase } from "../common/module-base"
import { AppDataSource } from "../data-source"
import { User } from "../entity/user"
import { getRequiredService } from "../service"
import { Command, CommandService } from "../service/command"
import { UserService } from "../service/user"


const logger = log4js.getLogger()

export class AntiRevokeModule extends ModuleBase {
    private userService!: UserService

    initialize(): void {
        this.userService = getRequiredService(UserService)
        getRequiredService(CommandService).register(new Command({
            names: ['anti-revoke-ignore'],
            perms: ['anti-revoke.admin'],
            commandOption: {
                add: {
                    type: 'string',
                    alias: 'a'
                },
                remove: {
                    type: 'string',
                    alias: 'r'
                },
                list: {
                    type: 'boolean',
                    alias: 'l'
                }
            },
            command: async (msg, args) => {
                if (args.add != undefined) {
                    this.userService.addPermission((args.add as string).concat('@c.us'), 'anti-revoke.ingore')
                    msg.reply(`successfully added '${args.add}' to ignore!`)
                }
                if (args.remove != undefined) {
                    this.userService.removePermission((args.remove as string).concat('@c.us'), 'anti-revoke.ingore')
                    msg.reply(`successfully removed '${args.remove}' from ignore!`)
                }
                if (args.list) {
                    let users = await AppDataSource.getRepository(User).find()
                    let result = users.filter(x => x.permissions.some(y => y === 'anti-revoke.ingore'))
                        .map(x => '\n+' + x.whatsappId.split('@')[0])
                        .reduce((x, y) => x + y)
                    msg.reply(`ignored users:${result}`)
                }
            }
        }))
        // this.mainModule.client.on('message_revoke_everyone', async (msg, revokedMsg) => {
        //     if (revokedMsg == null)
        //         return
        //     let sender = getMessageSender(msg)
        //     if (await this.userService.hasPermission(sender, 'anti-revoke.ingore'))
        //         return
        //     let chat = await msg.getChat()
        //     chat.sendMessage(`Anti-revoke BOT! +${sender.split('@')[0]} has revoked:\n${revokedMsg.body}`)
        // })
    }
}
