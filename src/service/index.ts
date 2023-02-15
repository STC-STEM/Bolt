import * as log4js from "log4js"
import { IServiceConstructor, ServiceBase } from "../common/service-base"
import { CommandService } from "./command"
import { UserService } from "./user"


const logger = log4js.getLogger()

const registeredServices: IServiceConstructor<ServiceBase>[] = [UserService, CommandService]
const initializedServices: ServiceBase[] = []
export { registeredServices, initializedServices}

var isInitialized: boolean = false
export function initialize() {
    if (!isInitialized) {
        isInitialized = true
        logger.info('Initializing Services...')
        for (let s of registeredServices) {
            initializedServices.push(new s())
            logger.info('Service Loaded:', s.prototype.constructor.name)
        }
        initializedServices.forEach(s => s.initialize())
    }
}

export function getRequiredService<T extends ServiceBase>(s: IServiceConstructor<T>): T {
    return initializedServices.find(x => x instanceof s) as T
}
