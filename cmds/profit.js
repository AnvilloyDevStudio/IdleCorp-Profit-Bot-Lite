const Discord = require("discord.js");
const setting = require("../setting.json");
const StringHandlers = require("../funcs/StringHandlers");
const icals = require("../icaliases.json");
const NumberHandlers = require("../funcs/NumberHandlers");
const calculate = require("../funcs/calculate");
const youKnow = require("../funcs/youKnow");
const fs = require("fs");

module.exports = {
	name: "profit",
	execute(message, args) {
        if (!args.length) return message.channel.send("`EN0001`: Missing facility name.")
        let num = (args.slice(-1)[0].match(/^\d+[kmb]?$/))? args.pop(): 1,
        unit, region, icd;
        if (["--version:", "--v:", "--ver:"].some(a => args[0].toLowerCase().startsWith(a))) {
            let flag = args.shift().split(":")[1].toLowerCase();
            if (fs.readdirSync("./icdetailvers").map(a => a.slice(9, -5)).includes(flag)) icd = require("../icdetailvers/icdetail_"+flag+".json");
            else return message.channel.send("`EN0022`: The IdleCorp source version was invalid.");
        } else icd = require("../icdetailvers/"+fs.readdirSync("./icdetailvers").slice(-1)[0])
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
        num *= {"day": 60*60*24, "hour": 60*60, "minute": 60}[unit]??1;
        calculate.productProfit(fac, "all", num, Boolean(region), region, icd).then(sol => {
            let cspd, cssp, pdpd, pdsp;
            if (sol[0] === "None") cspd = "None";
            else {
                cspd = Object.keys(sol[0]),
                cssp = Object.values(sol[0]);
            }
            if (sol[1] === "None") pdpd = "None";
            else {
                pdpd = Object.keys(sol[1]),
                pdsp = Object.values(sol[1]);
            }
            let s = [],
            s2 = [],
            c, p, pf;
            if (cspd !== "None") {
                for (let [a, b] of cspd.map((a, b) => [a, cssp[b]])) {
                    b = b.split(".")
                    s.push("**"+StringHandlers.capitalize(a).replaceAll("_", " ")+"** | $"+Number(b[0]).toLocaleString("en-US").toString()+((b[1])? "."+b.slice(1).join("."): ".00"));
                }
                c = s.join("\n");
            } else c = "None";
            if (pdpd !== "None") {
                for (let [a, b] of pdpd.map((a, b) => [a, pdsp[b]])) {
                    b = b.split(".")
                    s2.push("**"+StringHandlers.capitalize(a).replaceAll("_", " ")+"** | $"+Number(b[0]).toLocaleString("en-US").toString()+((b[1])? "."+b.slice(1).join("."): ".00"));
                }
                p = s2.join("\n");
            } else p = "None";
            if (Array.isArray(sol[2])) {
                const pfs = sol[2];
                for (let a of Object.values(pfs[0])) {
                    a = a.split(".");
                    pf = "**Max** | $"+Number(a[0]).toLocaleString("en-US").toString()+((a[1])? "."+a.slice(1).join("."): ".00")+"\n";
                }
                for (a of Object.values(pfs[1])) {
                    a = a.split(".");
                    pf += "**Min** | $"+Number(a[0]).toLocaleString("en-US").toString()+((a[1])? "."+a.slice(1).join("."): ".00");
                }
            } else {
                pf = sol[2].split(".");
                pf = "$"+Number(pf[0]).toLocaleString("en-US").toString()+((pf[1])? "."+pf.slice(1).join("."): ".00");
            }
            embed = new Discord.MessageEmbed()
                .setTitle(StringHandlers.capitalize(fac).replaceAll("_", " "))
                .setColor("BLUE")
                .setDescription("Unit: "+StringHandlers.capitalize(unit))
                .setTimestamp()
                .setAuthor(message.client.user.username, message.client.user.displayAvatarURL())
                .addFields([{name: "Consumes", value: c, inline: false},
                    {name: "Produces", value: p, inline: false},
                    {name: "Profit", value: pf, inline: false},
                    {name: "Note", value: "The result of this command is for calculation the basic values only, the actual profit may vary.\nThe calculation on **profit** also takes into account the consumption of the facility. While the **produce** section describes the gross profit without taking into account consumption.", inline: false}])
                .setFooter(message.client.user.username+" | "+setting["version"], message.client.user.displayAvatarURL())
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