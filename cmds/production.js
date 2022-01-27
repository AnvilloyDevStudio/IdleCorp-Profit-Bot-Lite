const Discord = require("discord.js");
const setting = require("../setting.json");
const StringHandlers = require("../funcs/StringHandlers");
const icals = require("../icaliases.json");
const NumberHandlers = require("../funcs/NumberHandlers");
const calculate = require("../funcs/calculate");
const youKnow = require("../funcs/youKnow");
const IdleCorpConnection = require("../funcs/IdleCorpConnection");
const Decimal = require("decimal.js");
const fs = require("fs");
const Fraction = require("fraction.js");
const Pages = require("../funcs/Pages");

module.exports = {
	name: "production",
	execute(message, args) {
        if (!args.length) return message.channel.send("`EN0001`: Missing facility name.")
        let region, icd;
        if (["--version:", "--v:", "--ver:"].some(a => args[0].toLowerCase().startsWith(a))) {
            let flag = args.shift().split(":")[1].toLowerCase();
            if (fs.readdirSync("./icdetailvers").map(a => a.slice(9, -5)).includes(flag)) {
                icd = require("../icdetailvers/icdetail_"+flag+".json");
            }
            else return message.channel.send("`EN0022`: The IdleCorp source version was invalid.");
        } else {
            icd = require("../icdetailvers/"+fs.readdirSync("./icdetailvers").slice(-1)[0])
        }
        if (["--rm:", "--regionmodifier:", "--modifier:", "--mod:"].some(a => args[0].toLowerCase().startsWith(a))) {
            let flag = args.shift().split(":")[1].toLowerCase();
            if (["hq", "icp", "idlecorp", "idlecorpprofit", "idlecorphq"].includes(flag)) region = {"idlecorp": "hq", "idlecorphq": "hq", "idlecorpprofit": "icp"}[flag]??flag;
            else return message.channel.send("`EN0022`: The region name was invalid.");
        }
        let goal = null;
        if (args[0].startsWith("--")) {
            if (["--to", "--until", "--goal"].includes(args[0].toLowerCase())) {
                args.shift()
                if (!args.length) return message.channel.send("`EN0021`: Missing production goal parameter.");
                goal = Math.ceil(NumberHandlers.numalias(args.shift()));
            } else if (["--production", "--produce", "--pd"].includes(args[0].toLowerCase())) {
                args.shift()
                if (!args.length) return message.channel.send("`EN0021`: Missing production parameter(s).");
                let mods = {technology: [], service: [], policy: []}
                if (args[0].startsWith("--")) {
                    if (args.length<3) return message.channel.send("`EN0021`: Missing production parameter(s).");
                    let c = args.filter(a => a.startsWith("--"))
                    if (c.some(a => !["--technology", "--tech", "--service", "--serv", "--policy"].includes(a))) return message.channel.send("`EN0022`: Invalid flag detected.")
                    const b = c.map(a => ({"--tech": "technology", "--serv": "service"}[a] ?? a.slice(2)))
                    const a = args.join(" ").match(new RegExp(c.reduce((a, b) => a+b+" {([\\w ]+(?:: ?[0-9]*)?(?:, ?[\\w ]+: ?[0-9]+)*)} ", "^").slice(0, -1)+"([\\w\\{\\}:, ]+)$"))
                    args = a[a.length-1].startsWith(" {")? a.pop().slice(1): "";
                    if (!a) return message.channel.send("`EN0022`: Invalid items detected.")
                    a.slice(1).map((a, c) => {
                        mods[b[c]] = a.split(/, ?/).map(a => a.split(/: ?/)).map(a => a[1]!==undefined? [Object.entries(icals["ic"][b[c]==="technology"? "technologies": b[c]==="service"? "services": "policies"]).find(b => b[1]?.includes(a[0]))?.[0] ?? a[0].replaceAll(" ", "_"), a[1]]: [Object.entries(icals["ic"][b[c]==="technology"? "technologies": b[c]==="service"? "services": "policies"]).find(b => b[1]?.includes(a[0]))?.[0] ?? a[0].replaceAll(" ", "_")])
                    })
                    if (mods["technology"].filter(a => !(a[0] in icals["ic"]["technologies"])).length||mods["service"].filter(a => !(a[0] in icals["ic"]["services"])).length||mods["policy"].filter(a => !(a[0] in icals["ic"]["policies"])).length) return message.channel.send("`EN0022`: Invalid items detected.")
                    if (mods["technology"].some(a => !/[0-9]+/.test(a[1]))) return message.channel.send("`EN0022`: Invalid number parameter detected, in technology parameter.");
                    else mods["technology"] = mods["technology"].map(a => [a[0], Number(a[1])])
                    const mod = new modifiers(icd);
                    if (mods["technology"].some(a => a.length<2)) return message.channel.send("`EN0022`: There is at least one element is missing amount, in technology parameter.")
                    if (mods["technology"].length) mod.technology(mods["technology"])
                    if (mods["service"].length) mod.service(mods["service"])
                    if (mods["policy"].length) mod.policy(mods["policy"])
                    mod.finialize();
                }
                let [facs, assets] = (typeof args === "string"? args: args.join(" ")).match(/^{([\w ]+: ?[0-9]+(?:, ?[\w ]+: ?[0-9]+)*)}(?: {([\w ]+: ?[0-9]+(?:, ?[\w ]+: ?[0-9]+)*)})?$/).slice(1);
                facs = facs.split(/, ?/).map(a => a.split(/: ?/)).map(a => [Object.entries(icals["ic"]["facilities"]).find(b => b[1]?.includes(a[0]))?.[0] ?? a[0].replaceAll(" ", "_"), a[1]])
                if (!facs||facs.filter(a => !(a[0] in icals["ic"]["facilities"])).length) return message.channel.send("`EN0022`: Invalid facilities and/or assets detected.")
                if (!assets) {
                    let production = Object.entries(icd["assets"]).map(a => [a[0], Fraction(0)])
                    for (const [a, b] of facs) {
                        const c = icd["facilities"][a];
                        if (c["consumes"] !== "None") for (const d of Object.entries(c["consumes"])) {
                            const e = production.find(a => a[0]===d[0])
                            e[1] = e[1].sub(Fraction(d[1], c["speed"]).mul(b))
                        }
                        for (const d of Object.entries(c["produces"])) {
                            const e = production.find(a => a[0]===d[0])
                            e[1] = e[1].add(Fraction(d[1], c["speed"]).mul(b))
                        }
                    }
                    production = production.filter(a => !a[1].equals(0))
                    const profit = production.reduce((a, b) => a.add(b[1].mul(icd["assets"][b[0]]*((b[1]<0)? 2: 1))), Fraction(0))
                    const page = new Pages(production.map(a => `**${StringHandlers.capitalize(a[0]).replaceAll("_", " ")}** | ${a[1].toString()}/s ${a[1].mul(60).toString()}/m ${a[1].mul(60*60).toString()}/h`), 6)
                    let pn = 1;
                    let embed = new Discord.MessageEmbed()
                        .setTitle("Production")
                        .setColor("BLUE")
                        .setDescription("Pages: 1/"+page.length())
                        .setTimestamp()
                        .addField("Input", "Facility\n> "+facs.map(a => StringHandlers.capitalize(a[0]).replaceAll("_", " ")+" | "+a[1]).join("\n> ")+(mods["technology"].length? "\nTechnology\n> "+mods["technology"].map(a => StringHandlers.capitalize(a[0].replaceAll("_", " "))+ " | "+a[1]).join("\n> "): "")+(mods["service"].length? "\nService\n> "+mods["service"].map(a => StringHandlers.capitalize(a[0].replaceAll("_", " "))).join("\n> "): "")+(mods["policy"].length? "\nPolicy\n> "+mods["policy"].map(a => StringHandlers.capitalize(a[0].replaceAll("_", " "))).join("\n> "): ""))
                        .addField("Result (profit)", "Net profit: "+profit.toString()+"/s "+profit.mul(60).toString()+"/min "+profit.mul(60*60).toString()+"/hr"+"\n\nAsset speed")
                        .addField("Result (asset speed(s))", page.page(1).join("\n"))
                        .setFooter(message.client.user.username+" | "+setting["version"], message.client.user.displayAvatarURL());
                    return message.channel.send(new Discord.MessageEmbed()
                        .setTitle("Did you know")
                        .setColor([85, 85, 85])
                        .setTimestamp()
                        .setDescription(youKnow.this())
                        .setAuthor(message.client.user.username, message.client.user.displayAvatarURL())
                        .setFooter(message.client.user.username+" | "+setting["version"], message.client.user.displayAvatarURL())
                    ).then(msg => setTimeout(() => msg.edit(embed).then(msg => 
                            msg.react("◀").then(() => msg.react("▶"))
                            .then(() => {
                                const back = msg.createReactionCollector((r, u) => r.emoji.name==="◀"&&u.id===message.author.id, {time: 30000})
                                back.on("collect", () => {
                                    pn = (pn===1)? page.length(): pn-1
                                    embed.fields[2].value = page.page(pn).join("\n")
                                    embed.setDescription("Pages: "+pn+"/"+page.length())
                                    msg.edit(embed)
                                });
                                const front = msg.createReactionCollector((r, u) => r.emoji.name==="▶"&&u.id===message.author.id, {time: 30000})
                                front.on("collect", () => {
                                    pn = (pn===page.length())? 1: pn+1
                                    embed.fields[2].value = page.page(pn).join("\n")
                                    embed.setDescription("Pages: "+pn+"/"+page.length())
                                    msg.edit(embed)
                                })})), 3000))
        
                } else {
                    assets = assets.split(/, ?/).map(a => a.split(/: /)).map(a => [Object.entries(icals["ic"]["assets"]).find(b => b[1]?.includes(a[0]))?.[0] ?? a[0], a[1]])
                    let production = Object.entries(icd["assets"]).map(a => [a[0], Fraction(0)])
                    let consumes = []
                    if (assets.filter(a => !(a[0] in icals["ic"]["assets"])).length) return message.channel.send("`EN0022`: Invalid asset(s) detected.");
                    for (const [a, b] of facs) {
                        const c = icd["facilities"][a];
                        if (c["consumes"] !== "None") for (const d of Object.entries(c["consumes"])) {
                            const e = production.find(a => a[0]===d[0])
                            e[1] = e[1].sub(Fraction(d[1], c["speed"]).mul(b))
                            consumes.push([d[0], d[1], c["speed"]])
                        }
                        for (const d of Object.entries(c["produces"])) {
                            const e = production.find(a => a[0]===d[0])
                            e[1] = e[1].add(Fraction(d[1], c["speed"]).mul(b))
                        }
                    }
                    for (let a = 0; a<consumes.length; a++) {
                        for (let b = 0; b<consumes.length; b++) {
                            if (a!==b&&consumes[a][0]===consumes[b][0]) {
                                const f = Fraction(consumes[a].slice(1)).add(Fraction(consumes[b].slice(1)))
                                consumes[a][1] = f.n
                                consumes[a][2] = f.d
                                consumes.splice(b, 1)
                            }
                        }
                    }
                    let remain = [], cycle = [], low = 0;
                    for (const a of assets) {
                        const cc = consumes.find(b => b[0]===a[0])
                        const c = ~~(a[1]/cc[1])
                        cycle.push([a[0], c, cc[2]*c])
                    }
                    let cycle1 = cycle.map(a => [a[0], a[2]])
                    for (let a = 0, lows = 0; a<cycle1.length; a++) {
                        if (cycle1[lows][1]>cycle1[a][1]) lows = a;
                        low = cycle1[lows][1]
                    }
                    let cycle2 = [];
                    for (const a of assets) {
                        const cc = consumes.find(b => b[0]===a[0])
                        const c = ~~(low/cc[2])
                        cycle2.push([c, c*cc[2]])
                        remain.push([a[0], Fraction(a[1]).sub(c*cc[1]).toString()])
                    }
                    production = production.filter(a => !a[1].equals(0))
                    const page = new Pages(production.map(a => `**${StringHandlers.capitalize(a[0]).replaceAll("_", " ")}** | ${a[1].toString()}/s ${a[1].mul(60).toString()}/m ${a[1].mul(60*60).toString()}/h`), 6)
                    const page1 = new Pages(remain.map((a, b) => `**${a[0]}** | ${a[1]} | ${cycle2[b][0]} (${cycle2[b][1]}s)`))
                    let pn = 1, pn1 = 1;
                    let embed = new Discord.MessageEmbed()
                        .setTitle("Production")
                        .setColor("BLUE")
                        .setDescription("Pages: 1/"+page.length()+"\nPages: 1/"+page1.length())
                        .setTimestamp()
                        .addField("Input", "Facility\n> "+facs.map(a => StringHandlers.capitalize(a[0]).replaceAll("_", " ")+" | "+a[1]).join("\n> ")+"\nAsset\n> "+assets.map(a => StringHandlers.capitalize(a[0]).replaceAll("_", " ")+" | "+a[1]).join("\n> ")+(mods["technology"].length? "\nTechnology\n> "+mods["technology"].map(a => StringHandlers.capitalize(a[0].replaceAll("_", " "))+ " | "+a[1]).join("\n> "): "")+(mods["service"].length? "\nService\n> "+mods["service"].map(a => StringHandlers.capitalize(a[0].replaceAll("_", " "))).join("\n> "): "")+(mods["policy"].length? "\nPolicy\n> "+mods["policy"].map(a => StringHandlers.capitalize(a[0].replaceAll("_", " "))).join("\n> "): ""))
                        .addField("Result (asset speed(s))", page.page(1).join("\n"))
                        .addField("Result (remain asset(s))", page1.page(1).join("\n"))
                        .setFooter(message.client.user.username+" | "+setting["version"], message.client.user.displayAvatarURL());
                    return message.channel.send(new Discord.MessageEmbed()
                        .setTitle("Did you know")
                        .setColor([85, 85, 85])
                        .setTimestamp()
                        .setDescription(youKnow.this())
                        .setAuthor(message.client.user.username, message.client.user.displayAvatarURL())
                        .setFooter(message.client.user.username+" | "+setting["version"], message.client.user.displayAvatarURL())
                    ).then(msg => setTimeout(() => msg.edit(embed).then(msg => 
                            msg.react("◀").then(() => msg.react("▶"))
                            .then(() => {
                                const back = msg.createReactionCollector((r, u) => r.emoji.name==="◀"&&u.id===message.author.id, {time: 30000})
                                back.on("collect", () => {
                                    pn = (pn===1)? page.length(): pn-1
                                    embed.fields[1].value = page.page(pn).join("\n")
                                    pn1 = (pn1===1)? page.length(): pn1-1
                                    embed.fields[2].value = page1.page(pn1).join("\n")
                                    embed.setDescription("Pages: "+pn+"/"+page.length()+"\nPages: "+pn1+"/"+page1.length())
                                    msg.edit(embed)
                                });
                                const front = msg.createReactionCollector((r, u) => r.emoji.name==="▶"&&u.id===message.author.id, {time: 30000})
                                front.on("collect", () => {
                                    pn = (pn===page.length())? 1: pn+1
                                    embed.fields[1].value = page.page(pn).join("\n")
                                    pn = (pn1===page1.length())? 1: pn1+1
                                    embed.fields[2].value = page1.page(pn1).join("\n")
                                    embed.setDescription("Pages: "+pn+"/"+page.length()+"\nPages: "+pn1+"/"+page1.length())
                                    msg.edit(embed)
                                })})), 3000))
        
                }
            }
        }
        else if (goal === undefined) return message.channel.send("`EN0011`: Missing command option(s).")
        else if (isNaN(goal)) return message.channel.send("`EN0022`: The production goal was invalid.");
        let num = 1;
        if (parseInt(args.slice(-1)[0])) {
            num = parseInt(args.pop());
        }
        let fac = args.join(" ").toLowerCase();
        if (!(fac.replaceAll(" ", "_") in icd["facilities"])) fac = Object.entries(icals["ic"]["facilities"]).find(a => (a[1]?.includes(fac)))?.[0];
        else fac = fac.replaceAll(" ", "_")
        if (!(fac in icd["facilities"])) return message.channel.send("`EN0002`: Invalid facility: "+args.join(" "));
        let faclist = icd["facilities"],
        faccs = faclist[fac]["consumes"], speed = faclist[fac]["speed"],
        modpro;
        if (region) {
            if (Array.isArray(speed)) modpro = IdleCorpConnection.getRegionMod(fac, region).then(b => speed = speed.map(a => Decimal(b).mul(a).toNumber()));
            else modpro = IdleCorpConnection.getRegionMod(fac, region).then(a => speed = Decimal(a).mul(speed).toNumber());
        } else modpro = Promise.resolve();
        modpro.then(() => {
            const cycle = Decimal(goal).div(Object.values(faclist[fac]["produces"])[0]).div(num);
            if (Array.isArray(speed)) speed = speed[0];
            const production = Math.ceil(cycle)*speed;
            embed = new Discord.MessageEmbed()
                .setTitle(StringHandlers.capitalize(fac).replaceAll("_", " "))
                .setColor("BLUE")
                .setTimestamp()
                .setAuthor(message.client.user.username, message.client.user.displayAvatarURL())
                .setDescription("Production time: "+production+" seconds ("+NumberHandlers.toTime(production).reduce((a, b, c) => (!c&&b === 0)? a: a.concat((b<10)? "0"+b: b), []).join(":")+")\nProduction cycle(s): "+cycle+" (at least needed: "+cycle.ceil()+")")
                .addFields([{name: "Required assets", value: (faccs === "None")? "> None": Object.entries(faccs).map(a => "> **"+StringHandlers.capitalize(a[0]).replaceAll("_", " ")+"** | "+a[1]*production*num), inline: false},
                    {name: "Note", value: "The result of this command is for calculation the basic values only, the actual profit may vary.", inline: false}])
                .setFooter(message.client.user.username+" | "+setting["version"], message.client.user.displayAvatarURL())
            message.channel.send(new Discord.MessageEmbed()
                .setTitle("Did you know")
                .setColor([85, 85, 85])
                .setTimestamp()
                .setDescription(youKnow())
                .setAuthor(message.client.user.username, message.client.user.displayAvatarURL())
                .setFooter(message.client.user.username+" | "+setting["version"], message.client.user.displayAvatarURL())
            ).then(msg => setTimeout(() => msg.edit(embed), 3000))
        })
    }
}

class modifiers {
    /** @param {import("../jsdoc").IdleCorp} ic */
    constructor(ic) {
        this.ic = ic;
        for (const a in this.ic.facilities) {
            let b = this.ic.facilities[a].speed
            if (typeof b === "number")
                b = Decimal(b)
            else
                b = [Decimal(b[0]), Decimal(b[1])]
            this.ic.facilities[a].speed = b
        }
    }
    /** @param {import("../jsdoc").techObj} techobj */
    technology(techobj) {
        techobj = techobj.sort().reduce((a, b, c, d) => 
            b[0].startsWith(d[c-1]?.[0])&&!["robotic_automation", "airport_tram", "quality_control"].some(a => b[0].includes(a))
            ? a: a.concat([b])
        , [])
        if (techobj.some(a => a[0].startsWith("robotic_automation"))) {
            for (const b of Object.values(this.ic.facilities)) {
                if (typeof b === "number") b.speed = b.speed.mul(techobj.filter(a => a[0].startsWith("robotic_automation")).reduce((a, b) => a.add(Decimal.mul(b[0].endsWith("_uu")? 0.06: b[0].endsWith("_u")? 0.04: 0.025, b[1]), Decimal(0))))
                else b.speed = b.speed.map(b => b.mul(techobj.filter(a => a[0].startsWith("robotic_automation")).reduce((a, b) => a.add(Decimal.mul(b[0].endsWith("_uu")? 0.06: b[0].endsWith("_u")? 0.04: 0.025, b[1]), Decimal(0)))))
            }
        }
        if (techobj.some(a => a[0].startsWith("airport_tram"))) {
            let b = this.ic.facilities.airport.speed[1]
            b = b.sub(techobj.filter(a => a[0].startsWith("airport_tram")).reduce((a, b) => a.add(Decimal.mul(b[0].endsWith("_u")? 8: 4, b[1]), Decimal(0))))
        }
        // if (techobj.some(a => a[0].startsWith("quality_control"))) {
        //     for (const b of Object.values(this.ic.facilities)) {
        //         b.speed = b.speed.mul(techobj.filter(a => a[0].startsWith("robotic_automation")).reduce((a, b) => a.add(Decimal.mul(b[0].endsWith("_uu")? 0.06: b[0].endsWith("_u")? 0.04: 0.025, b[1]), Decimal(0))))
        //     }
        // }
        techobj = Object.fromEntries(techobj)
        for (const a in techobj) {
            if (["robotic_automation", "airport_tram", "quality_control"].some(b => a.startsWith(b))) continue;
            if (a.startsWith("oil_mapping")) this.ic.facilities.oil_well.produces.crude_oil = a.endsWith("_uu")? 100: a.endsWith("_u")? 18: 14;
            else if (a.startsWith("coal_detector")) this.ic.facilities.coal_mine.produces.coal = a.endsWith("_uu")? 80: a.endsWith("_u")? 16: 12;
            else if (a.startsWith("log_loader")) {
                if (a.endsWith("_uu")) this.ic.facilities.tree_farm.produces.wood = 4;
                this.ic.facilities.tree_farm.speed -= a.endsWith("_uu")||a.endsWith("_u")? 2: 1;
            } else if (a.startsWith("advanced_woodworking")) this.ic.facilities.furniture_factory.speed -= a.endsWith("_uu")? 210: a.endsWith("_u")? 80: 40;
            else if (a.startsWith("bauxite_detector")) this.ic.facilities.bauxite_mine.produces.bauxite = a.endsWith("_u")? 60: 50;
            else if (a.startsWith("jet_fuel_refining")) {
                this.ic.facilities.oil_refinery.produces.jet_fuel = this.ic.facilities.oil_refinery.produces.gasoline
                this.ic.facilities.oil_refinery.produces.gasoline = 0;
                if (a.endsWith("_u")) this.ic.facilities.oil_refinery.speed -= 22;
            } else if (a.startsWith("gold_detector")) this.ic.facilities.gold_mine.produces.gold = a.endsWith("_uu")? 10: a.endsWith("_u")? 8: 6;
            else if (a.startsWith("vacuum_distillation")) this.ic.facilities.oil_refinery.speed -= a.endsWith("_u")? 22: 15;
            // else if (a.includes("specialization")) this.ic.facilities.oil_refinery.speed -= a.endsWith("_u")? 22: 15;
        }
    }
    tech = this.technology;
    /** @param {import("../jsdoc").techObj} servobj */
    service(servobj) {
        servobj = servobj.flatMap(a => a[0])
        //Happiness and Level
    }
    /** @param {import("../jsdoc").techObj} policyobj */
    policy(policyobj) {
        policyobj = policyobj.flatMap(a => a[0])
        if (policyobj.includes("research_grant")) this.ic.assets.energy *= 1.1;
        if (policyobj.includes("tourism_campaign")) {
            this.ic.facilities.airport.speed[1] = this.ic.facilities.airport.speed[1].sub(4)
            this.ic.facilities.airport.consumes.jet_fuel *= 4;
        }
        if (policyobj.includes("solar_subsidies")) this.ic.assets.energy *= 0.9;
        //Happiness
    }
    finialize() {
        for (const a in this.ic.facilities) {
            let b = this.ic.facilities[a].speed
            if (b instanceof Decimal)
                b = b.toNumber()
            else
                b = [b[0].toNumber(), b[1].toNumber()]
        }
    }
}