import * as log4js from "log4js";
import { Options as MinimistOptions } from "minimist-options";
import minimistBuildOptions from "minimist-options";
import minimist from 'minimist';
import shellQuote from 'shell-quote';
import { ServiceBase } from "../../common/service-base";
import { Message } from "whatsapp-web.js";
import { getRequiredService } from "..";
import { UserService } from "../user";
import { getMessageSender } from "../../util";


const logger = log4js.getLogger()

export class Command {
    names: string[]
    perms: string[]
    command: (msg: Message, args: minimist.ParsedArgs) => Promise<void>
    commandOption: MinimistOptions

    constructor(c: { names: string[], perms: string[], command: (msg: Message, args: minimist.ParsedArgs) => Promise<void>, commandOption: MinimistOptions}) {
        this.names = c.names
        this.perms = c.perms
        this.command = c.command
        this.commandOption = c.commandOption
    }

    async invoke(msg: Message, unparsedArgs: string) {
        await this.command(
            msg,
            minimist(
                shellQuote.parse(unparsedArgs).filter(x => !(x instanceof Object)) as string[],
                minimistBuildOptions(this.commandOption)
            )
        )
    }
}

export class CommandService extends ServiceBase {
    private userService!: UserService
    private commands: Command[] = []

    initialize(): void {

    }

    register(c: Command) {
        this.userService = getRequiredService(UserService)
        this.commands.push(c)
    }

    async invoke(msg: Message, cmdline: string, force: boolean = false) {
        let args = cmdline.split(' ')
        let cmdName = args.splice(0, 1)[0].substring(1)
        let cmdPara = args.join(' ')
        
        let c = this.commands.find(x => x.names.indexOf(cmdName) != -1)
        if (c == undefined)
            return
        if (!force && !await this.userService.hasPermission(getMessageSender(msg), c.perms)) {
            msg.reply('You do not have permission to exec this command')
            return
        }
        await c.invoke(msg, cmdPara)
    }
}