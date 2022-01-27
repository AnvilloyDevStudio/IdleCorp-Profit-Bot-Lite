const Discord = require("discord.js");
const setting = require("../../../setting.json");
const cdslist = require("../../../codes.json");

module.exports = {
    execute(message, args) {
        const cds = cdslist["codes"],
        oldnew = cdslist["oldnew"],
        oldver = cdslist["oldver"],
        code = args.pop()?.toUpperCase();
        if (!code) return message.channel.send("`EN0001`: Missing code or the code cannot be detected.");
        if (code.startsWith("--")) return message.channel.send("`EN0003`: Flag cannot be the last parameter. `EN0002`: Invalid code.");
        if (args.length) {
            if (args.every(a => !a.startsWith("--"))) return message.channel.send("`EN0013`: The number of parameters over the required.");
            if (args.length > 1) return message.channel.send("`EN0013`: The number of flags over the required.");
            const oth = args[0].slice(2).toLowerCase();
            if (oth.startsWith("old:")) {
                const a = oldnew[oth.split(":").slice(1).join(":").toLowerCase()];
                if (!(code in a)) return message.channel.send("`EN0002`: Invalid code in the code version reference track.")
                embed = new Discord.MessageEmbed()
                    .setTitle(`Error code reference track ${code} to ${a[code]}`)
                    .setDescription(cds["error"][a[code]]+"\n\nReference code v."+oth)
                    .setColor("DARK_RED")
                    .setTimestamp()
                    .setFooter(message.client.user.username+" | "+setting["version"], message.client.user.avatarURL());
                return message.channel.send(embed);
            } else if (oth in oldver) {
                if ("error" in oldver[oth]) {
                    if (code in oldver[oth]["error"]) {
                        if (code.includes("D") || code.includes("A")) {
                            const check = message.member.roles.cache;
                            if (code.includes("D") && !(check.get("841622372351344650") || check.get("801052590389329930") || check.get("801052697498746920"))) {
                                return message.channel.send("`EN0111`: The code was required permission.");
                            } else if (code.includes("A") && !(check.get("841622372351344650") || check.get("801052590389329930") || check.get("801052697498746920") || check.get("801052514556313620"))) {
                                return message.channel.send("`EN0112`: The code was required permission.");
                            } else {
                                embed = new Discord.MessageEmbed()
                                    .setTitle(`Error code ${code}`)
                                    .setDescription(oldver[oth]["error"][code]+"\n\nCode v."+cdslist["version"])
                                    .setColor("DARK_RED")
                                    .setTimestamp()
                                    .setFooter(message.client.user.username+" | "+setting["version"], message.client.user.avatarURL());
                                return message.channel.send(embed);
                            }
                        } else {
                            embed = new Discord.MessageEmbed()
                                .setTitle(`Error code ${code}`)
                                .setDescription(oldver[oth]["error"][code]+"\n\nCode v."+cdslist["version"])
                                .setColor("DARK_RED")
                                .setTimestamp()
                                .setFooter(message.client.user.username+" | "+setting["version"], message.client.user.avatarURL());
                            return message.channel.send(embed);
                        }
                    } else return message.channel.send("`EN0002`: Invalid code.");
                } else return message.channel.send("`EN0002`: The version record contains no about `error` codes.");
            } else return message.channel.send("`EN0012`: Invalid flag.");
        }
        for (const a in cds["error"]) {
            if (code === a) {
                const check = message.member.roles.cache;
                if (code[1] === "D" && !(check.get("841622372351344650") || check.get("801052590389329930") || check.get("801052697498746920"))) {
                    return message.channel.send("`EN0111`: The code was required permission.");
                } else if (code[1] === "A" && !(check.get("841622372351344650") || check.get("801052590389329930") || check.get("801052697498746920") || check.get("801052514556313620"))) return message.channel.send("`EN0112`: The code was required permission.");
                embed = new Discord.MessageEmbed()
                    .setTitle(`Error code ${a}`)
                    .setDescription(cds["error"][a]+"\n\nCode v."+cdslist["version"])
                    .setColor("DARK_RED")
                    .setTimestamp()
                    .setFooter(message.client.user.username+" | "+setting["version"], message.client.user.avatarURL());
                return message.channel.send(embed);
            }
        }
        if (code[0] !== "E") return message.channel.send("`EN0002`: Invalid code type.");
        message.channel.send("`EN0002`: Invalid code");
    }
}