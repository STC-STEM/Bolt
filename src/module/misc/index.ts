import * as log4js from "log4js"
import { ModuleBase } from "../../common/module-base"
import { getRequiredService } from "../../service"
import { Command, CommandService } from "../../service/command"

const logger = log4js.getLogger()

export class MiscModule extends ModuleBase {
    initialize(): void {
        getRequiredService(CommandService).register(new Command({
            names: ['version'],
            perms: [],
            commandOption: {},
            command: async (msg, args) => {
                msg.reply('Bolt is a very simple WhatsApp BOT!\nCurrent version: v0.0.0')
            }
        }))
        getRequiredService(CommandService).register(new Command({
            names: ['calcgaeness'],
            perms: [],
            commandOption: {},
            command: async (msg, args) => {
                if (args._.length > 0) {
                    msg.reply(`The gaeness of ${args._.join(' ')} is ${Math.floor(Math.random() * 101)}%`)
                }
            }
        }))
    }
}