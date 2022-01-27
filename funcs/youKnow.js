const ykl = require("../you_know.json");

module.exports = class youKnow {
    static this() {
        return ykl["list"][~~(Math.random()*ykl["list"].length)];
    }
    static embed(embed) {
        message.channel.send(new Discord.MessageEmbed()
                .setTitle("Did you know")
                .setColor([85, 85, 85])
                .setTimestamp()
                .setDescription(youKnow())
                .setAuthor(message.client.user.username, message.client.user.displayAvatarURL())
                .setFooter(message.client.user.username+" | "+setting["version"], message.client.user.displayAvatarURL())
            ).then(msg => setTimeout(() => msg.edit(embed), 3000))
    }
}