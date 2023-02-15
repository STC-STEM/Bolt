import * as log4js from "log4js"
import { ModuleBase } from "../common/module-base"
import { UserService } from "../service/user"
import { getRequiredService } from "../service"
import { Command, CommandService } from "../service/command"
import { getMessageSender } from "../util"
import { User } from "../entity/user"

const logger = log4js.getLogger()

export class UserModule extends ModuleBase {
    private userService!: UserService

    initialize(): void {
        this.userService = getRequiredService(UserService)
        getRequiredService(CommandService).register(new Command({
            names: ['user'],
            perms: ['user.admin'],
            commandOption:{
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
            command:async (msg, args) => {
                let userWSId: string | undefined;
                if (args._.length >= 1)
                    userWSId = args._.at(0)?.toString().concat('@c.us')
                else
                    userWSId = getMessageSender(msg)
                if (userWSId == undefined)
                    throw new Error('userWSId is undefined')
                
                if (args.add != undefined) {
                    this.userService.addPermission(userWSId, args.add)
                    msg.reply(`successfully added '${args.add}' permission to '+${userWSId.split('@')[0]}'!`)
                }
                if (args.remove != undefined) {
                    this.userService.removePermission(userWSId, args.remove)
                    msg.reply(`successfully removed '${args.remove}' permission from '+${userWSId.split('@')[0]}'!`)
                }
                if (args.list) {
                    let userPerms = (await this.userService.getUserByID(userWSId)).permissions.join(',\n')
                    msg.reply(`permissions of '+${userWSId.split('@')[0]}:\n${userPerms}`)
                }
            }
        }))
    }
}