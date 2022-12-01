import "reflect-metadata"
import * as log4js from "log4js"
import * as qrcode from "qrcode-terminal"
import { Client, LocalAuth, Message } from "whatsapp-web.js"
import { AppDataSource } from "./data-source"
import * as boltService from "./service"
import * as boltModule from "./module"
import { CommandService } from "./service/command"


log4js.configure({
    appenders: {
        logFile: {
            type: 'dateFile',
            filename: __dirname + '/../data/log/log',
            pattern: 'yyyy-MM-dd.log',
            alwaysIncludePattern: true
        },
        console: {
            type: 'console'
        }
    },
    categories: {
        default: { appenders: ['logFile', 'console'], level: 'all' }
    }
})
const logger = log4js.getLogger()


// let cmdMap: Map<string, (msg: Message, parameters: string[]) => void> = new Map([
//     // ["hello", function(msg, parameters) {
//     //     if (parameters.length > 0) {
//     //         msg.reply(`hi ${parameters.join(' ')}`)
//     //     }
//     //     else {
//     //         msg.reply('hi')
//     //     }
//     // }],
//     ['version', function(msg, parameters) {
//         msg.reply('Hello I am Bolt, a bot under test')
//     }],
//     ["calcgaeness", function(msg, parameters) {
//         if (parameters.length > 0) {
//             msg.reply(`The gaeness of ${parameters.join(' ')} is ${Math.floor(Math.random() * 101)}%`)
//         }
//     }]
// ])

const client = new Client({
    authStrategy: new LocalAuth()
})

client.on('loading_screen', (persent, msg) => {
    logger.info(`WhatsApp Loading... ${persent}% ${msg}`)
})

client.on('qr', qr => {
    logger.info('Login Required!')
    logger.debug('QRcode Content: ', qr)
    qrcode.generate(qr, {small: true})
})

client.on('authenticated', session => {
    logger.info(`Successfully Logged In!`)
})

client.on('auth_failure', err => {
    logger.error('Failed to login!', err)
})

client.on('ready', async () => {
    logger.info('Client Ready!')
    // let chats = await client.getChats()
    // let chatInfos = chats.map(x => `${x.isGroup ? 'Group' : 'Chat'} ID: ${x.id._serialized}, Name: ${x.name}`).join('\n')
    // logger.debug(`Chats:\n${chatInfos}`)
})

client.on('message_create', async msg => {
    logger.info(`Msg Recieved From: ${msg.from}, To: ${msg.to}, Body: ${msg.body}`)
    if (msg.body.startsWith('/')) {
        logger.debug(`Processing Command '${msg.body}' ...`)
        // let cmdLine = msg.body.split(' ')
        // let cmdName = cmdLine[0].substring(1)
        // cmdMap.forEach((func, key) => {
        //     if (cmdName === key) {
        //         let parameters = cmdLine.slice(1)
        //         func(msg, parameters)
        //     }
        // })
        try {
            await boltService.getRequiredService(CommandService).invoke(msg, msg.body)
        }
        catch (e) {
            logger.warn(`Error occur while handling command '${msg.body}',`, e)
        }
    }
});

(async () => {
    try {
        await AppDataSource.initialize()
    }
    catch (e) {
        logger.error('Failed to init database', e)
        process.exit(1)
    }

    boltService.initialize()
    boltModule.initialize({client: client})

    client.initialize()
})()
