const Discord = require("discord.js");
const setting = require("../setting.json")

module.exports = {
    name: "botinfo",
    execute(message, args) {
        const embed = new Discord.MessageEmbed()
            .setTitle("Bot info")
            .setColor("DARK_BLUE")
            .setTimestamp()
            .setDescription("A calculator and assistant bot for IdleCorp players.")
            .addField("Bot", `The project founder and the bot developer: <@484883489846591491>/<@683694351855255590>\nVersion: v.${setting.version}`, false)
            .addField("Community Discord", "IdleCorp: https://discord.gg/N9CH9wV\nIdleCorp Profit: https://discord.gg/UtDq7dkUVA")
            .addField("Wiki", "https://wiki.idlecorp.xyz/\nProject: https://wiki.idlecorp.xyz/index.php/IdleCorp_Profit:Home")
            .addField("Art", "Art rightfully related to IdleCorp is under Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0) https://creativecommons.org/licenses/by-nc-sa/4.0/.")
            .setFooter(message.client.user.username+" | "+setting.version, message.client.user.displayAvatarURL());
        message.channel.send(embed);
    },
};