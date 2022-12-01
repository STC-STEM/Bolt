import * as log4js from "log4js"
import { MainModule } from "../common/main-module";
import { IModuleConstructor, ModuleBase } from "../common/module-base";
import { AntiRevokeModule } from "./anti-revoke";
import { MPCModule } from "./mpc";

const logger = log4js.getLogger()

const registeredModules: IModuleConstructor<ModuleBase>[] = [MPCModule, AntiRevokeModule]
const initializedModules: ModuleBase[] = []
export { registeredModules, initializedModules }

var isInitialized: boolean = false
export function initialize(mm: MainModule) {
    if (!isInitialized) {
        isInitialized = true
        logger.info('Initializing Modules...')
        for (let m of registeredModules) {
            initializedModules.push(new m(mm))
            logger.info('Module Loaded:', initializedModules.at(-1)!['constructor'].name)
        }
        initializedModules.forEach(m => m.initialize())
    }
}
