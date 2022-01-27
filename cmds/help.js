const Decimal = require("decimal.js");
const Discord = require("discord.js");
const setting = require("../setting.json");
const math = require("mathjs");
const cmdInfo = require("../cmdsinfo.json");
const StringHandlers = require("../funcs/StringHandlers.js");

module.exports = {
    name: "help",
    execute(message, args) {
        if (!args.length) {
            embed = new Discord.MessageEmbed()
                .setTitle("Help")
                .setDescription("All the commands will show by categories, you cannot see administrator's when your permission was not enough.")
                .setColor("GREEN")
                .setTimestamp();
            const name = Object.keys(cmdInfo["aliases"]);
            let res = {};
            for (const [a, b] of Object.values(cmdInfo["descriptions"]).map((a, b) => [name[b], a])) {
                const cate = (["botinfo", "codes", "help", "info", "search"].includes(a))? "Information": (["calculate", "speed", "profit", "profitcomplete", "production"].includes(a))? "Calculation": (["reload", "send", "task", "idea"].includes(a))? "Administrator": "Other";
                check = message.member.roles.cache;
                if (["reload", "send", "task", "idea"].includes(a)&&!(check.has("841622372351344650") || check.has("801052590389329930") || check.has("801052697498746920"))) continue;
                if (!Array.isArray(res[cate])) res[cate] = [];
                res[cate].push([a, b]);
            }
            for (const a in res) embed.addField("**"+StringHandlers.capitalize(a)+"**", res[a].reduce((a, b) => a+b[0]+"\nDescriptions/Features: "+b[1]["_index"][0]+"\nSyntax: "+b[1]["_index"][1]+"\n\n", ""), false);
        } else {
            const ori = args.slice();
            let detail;
            let details = false;
            if (!["--info", "--if"].includes(args[0])) {
                if (["--details", "--detail", "--d"].includes(args[0])) {details = true; args.shift()}
                if (!(args[0] in cmdInfo["aliases"])) args[0] = Object.entries(cmdInfo["aliases"]).find(a => a[1]["_index"].includes(args[0]))?.[0];
                if (!args[0]) return message.channel.send(`\`EN0002\`: Cannot find command info named \`${ori.join(" ")}\`.`);
                if ((["reload"].includes(args[0]))&&!message.member.roles.cache.findKey((a, b) => ["841622372351344650", "801052590389329930", "801052697498746920"].includes(b))) return message.channel.send("`EN0111`: You don't have enough permission to see the details of the command.");
                detail = cmdInfo["details"][args[0]][1]
                if (detail) detail = Object.entries(detail).find(a => a[0] === args[1] || a[1]["aliases"].includes(args[1]))
            }
            if (detail) {
                if (!detail) return message.channel.send("`EN0002`: Cannot find command detail of `"+args[1]+"`.");
                embed = new Discord.MessageEmbed()
                    .setTitle("Help -- "+StringHandlers.capitalize(args[0]))
                    .setColor("GREEN")
                    .setTimestamp()
                    .addField(StringHandlers.capitalize(detail[0]), detail[1]["info"].map(a => StringHandlers.capitalize(a[0])+": "+a[1]).join("\n")+((detail[1]["aliases"]?.length)? "\nAliases: "+detail[1]["aliases"].join(", "): ""))
            } else if (["--info", "--if"].includes(args[0].toLowerCase())) {
                if (args.length<2) return message.channel.send("`EN0001`: Missing information parameter.")
                const info = args.slice(1).join(" ").replaceAll("_", " ");
                let infoctn;
                if (info !== "_aliases") infoctn = Object.keys(cmdInfo["info"]["_aliases"]).find(a => cmdInfo["info"]["_aliases"][a].includes(info)) ?? info;
                if (!(infoctn in cmdInfo["info"])) return message.channel.send("`EN0002`: The information parameter was invalid.");
                return message.channel.send(new Discord.MessageEmbed()
                    .setTitle("Help -- Information -- "+StringHandlers.capitalize(infoctn))
                    .setDescription(cmdInfo["info"][infoctn]+((infoctn === "list")? Object.keys(cmdInfo["info"]).slice(1).map(a => "> "+a).join("\n"): ""))
                    .setColor([17, 255, 170])
                    .setTimestamp()
                    .setAuthor(message.client.user.username, message.client.user.displayAvatarURL())
                    .setFooter(message.client.user.username+" | "+setting["version"], message.client.user.displayAvatarURL())
                )
            } else {
                let newargs = [args.shift()];
                while (args.length) {
                    let check = newargs.length && newargs.reduce((a, b) => a[b], cmdInfo["aliases"][newargs[0]]) || cmdInfo["aliases"][newargs[0]]
                    args[0] = Object.entries(check).find(b => b[1].includes(args[0]))?.[0] || args[0];
                    if (!check[args[0]]||args[0] === "_index") return message.channel.send(`\`EN0002\`: Cannot find command info named \`${ori.join(" ")}\``);
                    newargs.push(args.shift())
                }
                args = newargs;
                if (!(args[0] in cmdInfo["aliases"])) return message.channel.send(`\`EN0002\`: Cannot find command info named \`${ori.join(" ")}\``)
                embed = new Discord.MessageEmbed()
                    .setTitle("Help -- "+StringHandlers.capitalize(args[0]))
                    .setColor("GREEN")
                    .setTimestamp();
                res = args.reduce((a, b) => a.map(a => a[b]), [cmdInfo["descriptions"], cmdInfo["aliases"]]);
                if (res.filter(a => typeof(a)==="object"&&!Array.isArray(a)).length) res = res.map(a => a["_index"]);
                if (res[0].length===1) res[0].unshift(cmdInfo["descriptions"][args[0]]["_index"][0]);
                let addition = "";
                if (args.length === 1&&cmdInfo["details"][args[0]][0]) {
                    const detail = cmdInfo["details"][args[0]][0];
                    for (const [a, b] of Object.entries(detail)) {
                        if (!details&&(a === "_args" || a === "_argaliases")) continue;
                        addition += (a === "_args")? "\nParameter(s):\n"+Object.entries(b).map(a => "> `"+a[0]+"` -- "+a[1]).join("\n"): (a === "_describe")? "\nInformation: "+b: (a === "_argaliases")? "\nParameter aliases:\n"+Object.entries(b).map(a => "> "+a[0]+" | "+a[1].join(", ")).join("\n"): "\n"+a+": "+b;
                    }
                }
                if (addition.length>500) {
                    addition = addition.split("\n")
                    embed.addField(args.join(" "), "Description: "+res[0][0]+"\nSyntax: "+res[0][1]+addition.splice(0, ~~(addition.length/2)).join("\n"), false)
                    embed.addField("\u200b", addition.join("\n")+"\nAliases: "+res[1].join(", "), false)
                } else embed.addField(args.join(" "), "Description: "+res[0][0]+"\nSyntax: "+res[0][1]+addition+"\nAliases: "+res[1].join(", "), false)
            }
        }
        embed.setAuthor(message.client.user.username, message.client.user.displayAvatarURL())
            .setFooter(message.client.user.username+" | "+setting["version"], message.client.user.displayAvatarURL());
        let v;
        for (let f = 0; f<embed.fields.length; f++) if ((v = embed.fields[f].value).length>1024) {
            let vv = v.split("\n")
            embed.spliceFields(f, 1, {name: embed.fields[f].name, value: vv.splice(0, ~~(vv.length/2)).join("\n"), inline: false})
            embed.spliceFields(f+1, 0, {name: "\u200b", value: vv.join("\n"), inline: false})
        }
        message.channel.send(embed)
    }
}