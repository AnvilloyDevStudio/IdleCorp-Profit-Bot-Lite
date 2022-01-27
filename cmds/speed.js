const Discord = require("discord.js");
const setting = require("../setting.json");
const StringHandlers = require("../funcs/StringHandlers");
const icals = require("../icaliases.json");
const NumberHandlers = require("../funcs/NumberHandlers");
const calculate = require("../funcs/calculate");
const youKnow = require("../funcs/youKnow");
const fs = require("fs");

module.exports = {
	name: "speed",
	execute(message, args) {
        if (!args.length) return message.channel.send("`EN0001`: Missing facility name.")
        let num = (args.slice(-1)[0].match(/^\d+[kmb]?$/))? args.pop(): 1,
        unit, region, icd;
        if (["--version:", "--v:", "--ver:"].some(a => args[0].toLowerCase().startsWith(a))) {
            let flag = args.shift().split(":")[1].toLowerCase();
            if (fs.readdirSync("./icdetailvers").map(a => a.slice(9, -5)).includes(flag)) icd = require("../icdetailvers/icdetail_"+flag+".json");
            else return message.channel.send("`EN0022`: The IdleCorp source version was invalid.");
        }  else icd = require("../icdetailvers/"+fs.readdirSync("./icdetailvers").slice(-1)[0])
        if (["--rm:", "--regionmodifier:", "--modifier:", "--mod:"].some(a => args[0].toLowerCase().startsWith(a))) {
            let flag = args.shift().split(":")[1].toLowerCase();
            if (["hq", "icp", "idlecorp", "idlecorpprofit", "idlecorphq"].includes(flag)) region = {"idlecorp": "hq", "idlecorphq": "hq", "idlecorpprofit": "icp"}[flag]??flag;
            else return message.channel.send("`EN0022`: The region name was invalid.");
        }
        if (args[0].startsWith("--")) {
            let flag = args.shift().toLowerCase().slice(2);
            const flagals = {"sec": "second", "s": "second", "min": "minute", "m": "minute", "hr": "hour", "h": "hour", "d": "day"}
            if (flag in flagals) flag = flagals[flag], unit = flag;
            else if (!["second", "minute", "hour", "day"].includes(flag)) return message.channel.send("`EN0012`: Invalid flag.");
        } else unit = "second";
        fac = args.join(" ").toLowerCase();
        if (!(fac.replaceAll(" ", "_") in icd["facilities"])) fac = Object.entries(icals["ic"]["facilities"]).find(a => (a[1]?.includes(fac)))?.[0];
        else fac = fac.replaceAll(" ", "_")
        if (!(fac in icd["facilities"])) return message.channel.send("`EN0002`: Invalid facility: "+args.join(" "));
        if (typeof(num) === "string") num = NumberHandlers.numalias(num);
        calculate.productSpeed(fac, "all", num, Boolean(region), region, icd).then(sol => {
            let cspd, cssp, pdpd, pdsp;
            if (sol[0] === "None") cspd = "None";
            else {
                cspd = Object.keys(sol[0]);
                cssp = Object.values(sol[0]);
            }
            if (sol[1] !== "None") {
                pdpd = Object.keys(sol[1]);
                pdsp = Object.values(sol[1]);
            } else pdpd = "None";
            let s = [], c, p;
            if (cspd !== "None") {
                for (let a of cspd.map((a, b) => [a, cssp[b]])) {
                    a[1] = a[1].split(".");
                    s.push("**"+StringHandlers.capitalize(a[0]).replaceAll("_", " ")+"**"+" | "+Number(a[1][0]).toLocaleString("en-US").toString()+((a[1][1])? "."+a[1].slice(1).join("."): ".00"));
                }
                c = s.join("\n")
            } else c = "None";
            s = [];
            if (pdpd !== "None") {
                for (let a of pdpd.map((a, b) => [a, pdsp[b]])) {
                    a[1] = a[1].split(".")
                    s.push("**"+StringHandlers.capitalize(a[0]).replaceAll("_", " ")+"**"+" | "+Number(a[1][0]).toLocaleString("en-US").toString()+((a[1][1])? "."+a[1].slice(1).join("."): ".00"));
                }
                p = s.join("\n");
            }
            else p = "None";
            embed = new Discord.MessageEmbed()
                .setTitle(StringHandlers.capitalize(fac).replaceAll("_", " "))
                .setColor("BLUE")
                .setDescription("Unit: "+StringHandlers.capitalize(unit))
                .setTimestamp()
                .setAuthor(message.client.user.username, message.client.user.displayAvatarURL())
                .addFields([{name: "Consumes", value: c, inline: false},
                    {name: "Produces", value: p, inline: false},
                    {name: "Note", value: "The result of this command is for calculation the basic values only, The actual production speeds may vary", inline: false}])
                .setFooter(message.client.user.username+" | "+setting["version"], message.client.user.displayAvatarURL());
            message.channel.send(new Discord.MessageEmbed()
                .setTitle("Did you know")
                .setColor([85, 85, 85])
                .setTimestamp()
                .setDescription(youKnow.this())
                .setAuthor(message.client.user.username, message.client.user.displayAvatarURL())
                .setFooter(message.client.user.username+" | "+setting["version"], message.client.user.displayAvatarURL())
            ).then(msg => setTimeout(() => msg.edit(embed), 3000))
        })
    }
}