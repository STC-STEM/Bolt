import { DataSource } from "typeorm"
import { MPCCron } from "./entity/mpc-cron"
import { User } from "./entity/user"

export const AppDataSource = new DataSource({
    type: 'sqlite',
    database: __dirname + '/../data/bolt.sqlite',
    synchronize: true,
    entities: [User, MPCCron]
})
