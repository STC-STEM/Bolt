import * as log4js from "log4js"
import { MainModule } from "../../common/main-module";
import { ModuleBase } from "../../common/module-base";
import { getRequiredService } from "../../service";
import { Command, CommandService } from "../../service/command";


const logger = log4js.getLogger()

export class MPCModule extends ModuleBase {
    initialize(): void {
        getRequiredService(CommandService).register(new Command({
            names: ['mpc'],
            perms: ['mpc'],
            commandOption: {},
            command: async (msg, args) => {
                msg.reply(args._[0])
            }
        }))
    }
}
