const Discord = require("discord.js");
const setting = require("../setting.json");
const StringHandlers = require("../funcs/StringHandlers");
const icals = require("../icaliases.json");
const NumberHandlers = require("../funcs/NumberHandlers");
const calculate = require("../funcs/calculate");
const youKnow = require("../funcs/youKnow");
const fs = require("fs");

module.exports = {
	name: "profitcomplete",
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
        calculate.facratio(fac, num, Boolean(region), region, icd).then(a => 
            calculate.produceRemain(fac, a[2], num, a[2], Boolean(region), region, icd).then(b => {
                num *= {"day": 60*60*24, "hour": 60*60, "minute": 60}[unit]??1;
                const c = calculate.firstFac(fac, a[2], num);
                return Promise.all([calculate.productProfit(fac, "all", num, Boolean(region), region, icd),
                    soland = calculate.productProfitLand(fac, "all", num, c[2], Boolean(region), region, icd)]).then(result2 => [a, b, c, ...result2])
        })).then(result => {
            const [facratio, remain, firstfac, sol, soland] = result;
            let s2 = [],
            count = 0,
            pf, pfland;
            for (const a of [sol[0], sol[1], soland[1]]) {
                let s = []
                if (a !== "None") {
                    for (let b of Object.entries(a)) {
                        b[1] = b[1].split(".");
                        s.push("**"+StringHandlers.capitalize(b[0]).replaceAll("_", " ")+"** | $"+Number(b[1][0]).toLocaleString("en-US").toString()+((b[1][1])? "."+b[1].slice(1).join("."): ".00")+((count === 2)? "/land": ""));
                    }
                    s2.push(s.join("\n"));
                } else s2.push("None");
                count++;
            }
            const [c, p, pland] = s2;
            if (Array.isArray(sol[2])) {
                const pfs = sol[2];
                for (let a of Object.values(pfs[0])) {
                    a = a.split(".");
                    pf = "**Max** | $"+Number(a[0]).toLocaleString("en-US").toString()+((a[1])? "."+a.slice(1).join("."): ".00")+"\n";
                }
                for (let a of Object.values(pfs[1])) {
                    a = a.split(".");
                    pf += "**Min** | $"+Number(a[0]).toLocaleString("en-US").toString()+((a[1])? "."+a.slice(1).join("."): ".00");
                }
            } else {
                pf = sol[2].split(".")
                pf = "$"+Number(pf[0]).toLocaleString("en-US").toString()+((pf[1])? "."+pf.slice(1).join("."): ".00");
            }
            if (Array.isArray(soland[2])) {
                const pfs = soland[2];
                for (let a of Object.values(pfs[0])) {
                    a = a.split(".");
                    pfland = "**Max** | $"+Number(a[0]).toLocaleString("en-US").toString()+((a[1])? "."+a.slice(1).join("."): ".00")+"/land\n";
                }
                for (let a of Object.values(pfs[1])) {
                    a = a.split(".");
                    pfland += "**Min** | $"+Number(a[0]).toLocaleString("en-US").toString()+((a[1])? "."+a.slice(1).join("."): ".00")+"/land";
                }
            } else {
                pfland = soland[2].split(".");
                pfland = "$"+Number(pfland[0]).toLocaleString("en-US").toString()+((pfland[1])? "."+pfland.slice(1).join("."): ".00")+"/land";
            }
            let rem = [];
            for (let a of remain[0]) {
                a[1] = a[1].split(".");
                rem.push("**"+StringHandlers.capitalize(a[0]).replaceAll("_", " ")+"** | "+Number(a[1][0]).toLocaleString("en-US").toString()+((a[1][1])? "."+a[1].slice(1).join("."): ".00"));
            }
            rem.push("");
            for (const a of remain[1]) {
                a[1] = a[1].split(".");
                rem.push("**"+StringHandlers.capitalize(a[0]).replaceAll("_", " ")+"** | $"+Number(a[1][0]).toLocaleString("en-US").toString()+((a[1][1])? "."+a[1].slice(1).join("."): ".00"));
            }
            rem = rem.join("\n")+"\n\nTotal remain: $"+remain[2]+"/land";
            fac = StringHandlers.capitalize(fac).replaceAll("_", " ");
            embed = new Discord.MessageEmbed()
                .setTitle(fac)
                .setColor("BLUE")
                .setDescription("Unit: "+StringHandlers.capitalize(unit))
                .setTimestamp()
                .setAuthor(message.client.user.username, message.client.user.displayAvatarURL())
                .addFields([{name: "Consumes", value:c, inline: false},
                    {name: "Produces", value: p+"\n\n"+pland, inline: false},
                    {name: "Profit", value: pf+"\n\n"+pfland, inline: false},
                    {name: "Complete Information", value: "Ratio(order follow to above): "+facratio[0]+" "+facratio[1]+"\n\n**First Facility(First Fac)/Require facilities:**\n"+firstfac[0]+"\n"+firstfac[1], inline: false},
                    {name: "Produce Remains", value: rem, inline: false},
                    {name: "Note", value: "The result of this command is for calculation the basic values only, the actual profit may vary.\nThe calculation on **profit** also takes into account the consumption of the facility. While the **produce** section describes the gross profit without taking into account consumption.", inline: false}])
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