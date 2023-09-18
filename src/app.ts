import "reflect-metadata"
import * as log4js from "log4js"
import * as qrcode from "qrcode-terminal"
import * as cron from "node-cron"
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


const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox']
    }
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

var ready = false
var transfering = true
client.on('ready', async () => {
    logger.info('Client Ready!')
    logger.info('Waiting until messsage transfer finished')
    let timeoutCallBack = () => {
        if (transfering) {
            setTimeout(timeoutCallBack, 1000)
            logger.info('tranfering...')
        }
        else {
            ready = true
            logger.info('transfer finished!')
        }
        transfering = false
    }
    timeoutCallBack()
    // let chats = await client.getChats()
    // let chatInfos = chats.map(x => `${x.isGroup ? 'Group' : 'Chat'} ID: ${x.id._serialized}, Name: ${x.name}`).join('\n')
    // logger.debug(`Chats:\n${chatInfos}`)
})

client.on('message_create', async msg => {
    logger.info(`Msg Recieved From: ${msg.from}, To: ${msg.to}, Body: ${msg.body}`)
    if (!ready){
        transfering = true
        return
    }
    if (msg.body.startsWith('/')) {
        logger.debug(`Processing Command '${msg.body}' ...`)
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

cron.schedule('30 0 * * *', () => client.resetState())
