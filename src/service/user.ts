import * as log4js from "log4js"
import { ServiceBase } from "../common/service-base";
import { User } from "../entity/user";

const logger = log4js.getLogger()

export class UserService extends ServiceBase {
    initialize(): void {
        
    }

    async getUserByID(whatsappId: string) {
        let user = await User.findOneBy({whatsappId: whatsappId})
        user ??= await User.save(
            User.create({whatsappId: whatsappId})
        )
        return user
    }

    async hasPermission(whatsappId: string, perm: string): Promise<boolean>
    async hasPermission(whatsappId: string, perms: string[]): Promise<boolean>
    async hasPermission(whatsappId: string, perm: string | string[]): Promise<boolean> {
        const user = await this.getUserByID(whatsappId)
        const realHasPermission = (perm: string): boolean => {
            if (user.permissions.includes(perm))
                return true

            let permSecs = perm.split('.')
            for (let i = permSecs.length; i >= 0; i--) {
                permSecs[i] = '*'
                let reConcated = permSecs.slice(0, i + 1).join('.')
                if (user.permissions.includes(reConcated))
                    return true
            }
            return false
        }
        
        if (typeof perm === 'string')
            return realHasPermission(perm)
        else
            return perm.every(x => realHasPermission(x))
    }

    async addPermission(whatsappId: string, perm: string) {
        const user = await this.getUserByID(whatsappId)
        if (user.permissions.some(x => x === perm))
            return
        user.permissions.push(perm)
        await User.save(user)
    }

    async removePermission(whatsappId: string, perm: string) {
        const user = await this.getUserByID(whatsappId)
        if (user.permissions.every(x => x !== perm))
            return
        user.permissions.splice(user.permissions.indexOf(perm), 1)
        await User.save(user)
    }
}