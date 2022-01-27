const Discord = require("discord.js")
const EventEmitter = require('events');
process.version
module.exports = class historyPipe {
    static Message = class extends EventEmitter {
        constructor(process) {
            super();
            this.process = process;
            this.process.send(["authorbot"])
            this.process.once("message", data => {
                this.author.bot = data
                this.process.send(["content"])
                this.process.once("message", data => {
                    this.content = data
                    this.process.send(["clientusername"])
                    this.process.once("message", data => {
                        this.client.user.username = data
                        this.process.send(["clientuserdisplayavatar"])
                        this.process.once("message", data => {
                            this.client.user.displayAvatarURL = () => data
                            this.process.send(["memberrolescache"])
                            this.process.once("message", data => {
                                this.member.roles.cache = data.reduce((a, b) => a.set(b[0], b[1]), new Discord.Collection())
                                this.process.send(["clientwsping"])
                                this.process.once("message", data => {
                                    this.client.ws.ping = data
                                    this.emit("ready", this)
                                })
                            })
                        })
                    })
                })
            })
        }
        channel = {
            send: (...content) => {
                this.process.send(["send", ...content])
                return new Promise(rs => this.process.once("message", data => rs(new historyPipe.EditMessage(data, this.process))))
            }
        }
        author = {
        }
        client = {
            user: {
            },
            ws: {}
        }
        member = {
            roles: {}
        }
    }
    static EditMessageID = () => Date.now().toString()
    static EditMessage = class {
        constructor(id, process) {
            this.id = id,
            this.process = process
        }
        edit = (...content) => {
            this.process.send(["edit", this.id, ...content])
            return Promise.resolve(this)
        }
    }
}