import { Message } from "whatsapp-web.js";

export function getMessageSender(msg: Message) {
    let author = msg.author
    if (author == undefined)
        return msg.from
    else
        return author
}
