import * as log4js from "log4js"
import { ServiceBase } from "../../common/service-base";
import { AppDataSource } from "../../data-source";
import { User } from "../../entity/user";

const logger = log4js.getLogger()

export class UserService extends ServiceBase {
    initialize(): void {
        
    }

    async getUserByID(whatsappId: string) {
        let user = await AppDataSource.getRepository(User).findOneBy({whatsappId: whatsappId})
        if (user == null) {
            user = new User()
            user.whatsappId = whatsappId
            await AppDataSource.getRepository(User).save(user)
        }
        return user
    }

    async hasPermission(whatsappId: string, perm: string): Promise<boolean>
    async hasPermission(whatsappId: string, perms: string[]): Promise<boolean>
    async hasPermission(whatsappId: string, perm: string | string[]): Promise<boolean> {
        const user = await this.getUserByID(whatsappId)
        if (typeof perm === 'string')
            return user.permissions.some(x => x === perm)
        else
            return perm.every(x => user.permissions.some(y => y === x))
    }

    async addPermission(whatsappId: string, perm: string) {
        const user = await this.getUserByID(whatsappId)
        if (user.permissions.some(x => x === perm))
            return
        user.permissions.push(perm)
        await AppDataSource.getRepository(User).save(user)
    }

    async removePermission(whatsappId: string, perm: string) {
        const user = await this.getUserByID(whatsappId)
        if (user.permissions.every(x => x !== perm))
            return
        user.permissions.splice(user.permissions.indexOf(perm), 1)
        await AppDataSource.getRepository(User).save(user)
    }
}