import { DataSource } from "typeorm"
import { User } from "./entity/user"

export const AppDataSource = new DataSource({
    type: 'sqlite',
    database: __dirname + '/../data/bolt.sqlite',
    synchronize: true,
    entities: [User]
})
