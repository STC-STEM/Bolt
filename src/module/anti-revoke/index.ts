import * as log4js from "log4js"
import { MainModule } from "../../common/main-module"
import { ModuleBase } from "../../common/module-base"
import { User } from "../../entity/user"
import { getRequiredService } from "../../service"
import { Command, CommandService } from "../../service/command"
import { UserService } from "../../service/user"
import { getMessageSender } from "../../util"

const logger = log4js.getLogger()

export class AntiRevokeModule extends ModuleBase {
    private userService!: UserService

    constructor(mm: MainModule) {
        super(mm)
    }

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
            }
        }))
        this.mainModule.client.on('message_revoke_everyone', async (msg, revokedMsg) => {
            if (revokedMsg == null)
                return
            let sender = getMessageSender(msg)
            if (await this.userService.hasPermission(sender, 'anti-revoke.ingore'))
                return
            let chat = await msg.getChat()
            chat.sendMessage(`Anti-revoke BOT! ${sender.split('@')[0]} has revoked:\n${revokedMsg.body}`)
        })
    }
}
