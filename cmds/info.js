const Decimal = require("decimal.js");
const Discord = require("discord.js");
const setting = require("../setting.json");
const fs = require("fs/promises");
const cmdInfo = require("../cmdsinfo.json");
const icals = require("../icaliases.json");
const StringHandlers = require("../funcs/StringHandlers.js");
fs.constants = require("fs").constants;

module.exports = {
    name: "info",
    execute(message, args) {
        let techlv, icd;
        if (["--version:", "--v:", "--ver:"].some(a => args[0].toLowerCase().startsWith(a))) {
            let flag = args.shift().split(":")[1].toLowerCase();
            const fs = require("fs");
            if (fs.readdirSync("./icdetailvers").map(a => a.slice(9, -5)).includes(flag)) icd = require("../icdetailvers/icdetail_"+flag+".json");
            else return message.channel.send("`EN0002`: The IdleCorp source version was invalid.");
        } else icd = require("../icdetailvers/"+require("fs").readdirSync("./icdetailvers").slice(-1)[0])
        const icinfo = icd["info"];
        let theme = false;
        if (["--topic", "--t", "--theme"].includes(args[0])) {
            args.shift();
            theme = true;
        }
        let req = args.join(" ");
        if (theme) {
            req = Object.entries(icinfo.themes.aliases).find(a => a[1].includes(req))?.[0] ?? req;
            let embed = new Discord.MessageEmbed().setColor("GREYPLE").setTimestamp().setFooter(message.client.user.username+" | "+setting["version"], message.client.user.displayAvatarURL())
            if (req==="all") return message.channel.send(embed.setTitle("Theme -- All themes").setDescription("Themes:\n"+Object.keys(icinfo.themes.themes).map(a => "> "+StringHandlers.capitalize(a)).join("\n")))
            else if (req==="aliases") return message.channel.send(embed.setTitle("Theme -- All theme aliases").setDescription("Theme aliases:\n"+Object.entries(icinfo.themes.themes).map(a => "> "+a[0]+" | "+(a[1].join("\n") || "None"))))
            if (!(req in icinfo.themes.themes)) return message.channel.send("`EN0002`: The theme name is invalid.")
            return message.channel.send(embed.setTitle("Theme -- "+StringHandlers.capitalize(req)).setDescription(icinfo.themes.themes[req].join("\n")))
        }
        let reqsl = Object.values(icinfo).reduce((a, b) => a.concat(Object.keys(b)), []).find(a => a===req||a===req.replaceAll(" ", "_")) || Object.entries(Object.values(icals["ic"]).reduce((a, b) => Object.assign(a, b))).find(a => a[1]?.includes(req))?.[0];
        if (!reqsl) return message.channel.send(`\`EN0002\`: Cannot find info of: ${req}, check your input`);
        if (reqsl.endsWith("_u")) reqsl = reqsl.slice(0, -2), techlv = 1;
        else if (reqsl.endsWith("_uu")) reqsl = reqsl.slice(0, -3), techlv = 2;
        else techlv = 0;
        if (!Object.values(icinfo).reduce((a, b) => a.concat(Object.keys(b)), []).find(a => a===reqsl)) return message.channel.send(`\`EN0004\`: Cannot find info of: ${req}, check your input`);
        const infoclass = Object.entries(icinfo).find(a => reqsl in a[1])[0];
        const theinfo = icinfo[infoclass][reqsl];
        let embed = new Discord.MessageEmbed()
            .setTitle(`Info -- ${StringHandlers.capitalize(infoclass)} -- ${StringHandlers.capitalize(reqsl.replaceAll("_", " "))}`)
            .setColor("GREYPLE")
            .setTimestamp()
            .setFooter(message.client.user.username+" | "+setting["version"], message.client.user.displayAvatarURL())
        let img, imgset;
        if (infoclass === "assets") {
            embed.addFields([{name: "IdleCorp Info(Examine):", value: theinfo["icinfo"]+((theinfo["difficulty"])? "\nDifficulty: "+theinfo["difficulty"].toUpperCase(): "")+"\n\n"+((theinfo["market"])? "It's tradable in market": "It's not tradable in market")+((theinfo["retail"])? "\nIt can sold in retail store\nIt can be scrapped into "+theinfo["retail"]+" scraps": "\nIt cannot sold in retail storen\nIt cannot be scrapped")+((theinfo["rarity"])? "\n\nRarity: **"+theinfo["rarity"]+"**": "")+"\n\nNPC market buy price(if valid): "+(icd["assets"][reqsl]*2).toString()+"\nNPC market sell price: "+icd["assets"][reqsl].toString(), inline: false},
                {name: "IdleCorp Wiki:", value: theinfo["icwiki"], inline: false},
                {name: "Wikipedia:", value: theinfo["wikipedia"], inline: false}]);
            if ("icp" in theinfo) embed.addField("IdleCorp Profit:", theinfo["icp"], false);
            img = "./images/info/"+((reqsl.startsWith("galactic_coordinates"))? "galactic_coordinates": (reqsl.startsWith("relic"))? "relic": reqsl)+".png"
            imgset = fs.access(img, fs.constants.F_OK).catch(() => img = "./images/info/box.png");
            embed.addField("\u200b", (icals["ic"]["assets"][reqsl])? "Aliases: "+icals["ic"]["assets"][reqsl].join(", "): "Aliases: None"+"\n\n[IdleCorp Wiki](https://wiki.idlecorp.xyz/index.php/"+reqsl+")\n"+(
                (reqsl === "led")? "[Wikipedia](https://en.wikipedia.org/wiki/Light-emitting_diode)":
                (reqsl === "rubber")? "[Wikipedia](https://en.wikipedia.org/wiki/synthetic_rubber)":
                (reqsl === "energy")? "[Wikipedia](https://en.wikipedia.org/wiki/electricity)":
                (reqsl === "lamp")? "[Wikipedia](https://en.wikipedia.org/wiki/light_fixture)":
                (reqsl === "ccd")? "[Wikipedia](https://en.wikipedia.org/wiki/charge-coupled_device)":
                (reqsl === "hq")? "[Wikipedia](https://en.wikipedia.org/wiki/Headquarters)":
                (theinfo["wikipedia"] !== "None")? "[Wikipedia](https://en.wikipedia.org/wiki/"+reqsl+"})": ""
            ), false);
        } else if (infoclass === "facilities") {
            embed.addFields([{name: "IdleCorp Info(Examine):", value: theinfo["icinfo"], inline: false},
                {name: "Construction materials:", value: Object.entries(theinfo["construct"]).map(a => (a[0] === "money")? "> $"+a[1].toLocaleString("en-US", {minimumFractionDigits: 2}): "> "+a[1].toLocaleString("en-US")+" **"+StringHandlers.capitalize(a[0])).join("\n"), inline: false},
                {name: "IdleCorp Wiki:", value: theinfo["icwiki"], inline: false},
                {name: "Wikipedia:", value: theinfo["wikipedia"], inline: false}]);
            if (reqsl in icd["facilities"]){
                const facpro = icd["facilities"][reqsl];
                embed.addField("Production:", "**Consumes**\n"+((facpro["consumes"] === "None")? "None\n": Object.entries(facpro["consumes"]).map(a => "**"+(StringHandlers.capitalize(a[0])).replaceAll("_", " ")+"** | "+a[1].toLocaleString("en-US", {minimumFractionDigits: 2}), []))+"\n**Produces**\n"+((facpro["produces"] === "None")? "None\n": Object.entries(facpro["produces"]).map(a => "**"+(StringHandlers.capitalize(a[0])).replaceAll("_", " ")+"** | "+a[1].toLocaleString("en-US", {minimumFractionDigits: 2}), []))+"Speed: "+icd["facilities"][reqsl]["speed"].toString()+" seconds", false);
            }
            if ("icp" in theinfo) embed.addField("IdleCorp Profit:", theinfo["icp"], false);
            img = "./images/info/"+reqsl+".png"
            imgset = fs.access(img, fs.constants.F_OK).catch(() => img = ((reqsl.endsWith("mine"))? "./images/info/mine.png":
                (["ccd_factory", "cpu_factory", "cell_phone_factory", "laptop_factory", "digital_camera_factory", "television_factory"].includes(reqsl))? "./images/info/tech_facility.png":
                (["retail_store", "research_facility", "customer_support_center", "hq"].includes(reqsl))? "./images/info/office_building.png":
                (["research_chemical_factory", "prescription_drug_factory"].includes(reqsl))? "./images/info/chemical_plant.png": "./images/info/facility.png")
            );
            embed.addField("\u200b", ((icals["ic"]["facilities"][reqsl])? "Aliases: "+icals["ic"]["facilities"][reqsl].join(", "): "Aliases: None")+(
                (reqsl === "steel_mill"&&Math.random() <= 0.02)? "\n\n*I always typo this facility as \"still mill\"*": "")+(
                (reqsl === "furniture_factory")? (
                    (Math.random() <= 0.2)? "\n\n*Why the IdleCorp Wiki page has so many words...*": "")+(
                    (Math.random() <= 0.1)? "\n\n*Because the IdleCorp Wiki page has too many work, I had to change the layout of all...*": ""
                ): "")+((reqsl.endsWith("factory")&&Math.random() <= 0.05)? "\n\n*I really want to know who made this facility page...*": "")+(
                (reqsl === "research_chemical_factory"&&Math.random() < (1/3))? "\n\n*Why this facility has so many aliases...*": "")+"\n\n\n[IdleCorp Wiki](https://wiki.idlecorp.xyz/index.php/"+reqsl+")"+((theinfo["wikipedia"] !== "None")? "\n[Wikipedia](https://en.wikipedia.org/wiki/"+reqsl+")": "")
            , false);
        } else if (infoclass === "blueprints") {
            embed.addFields([{name: "IdleCorp Info(Examine):", value: theinfo["icinfo"]+"\n\nRarity: "+theinfo["rarity"]+"\n\nAll blueprints **cannot** trade and be sold in the market and the retail stores.", inline: false},
                {name: "Requires:", value: Object.entries(theinfo["require"]).map(a => a[1].toLocaleString("en-US", {minimumFractionDigits: 2})+" **"+StringHandlers.capitalize(a[0])+"**", []), inline: false},
                {name: "IdleCorp Wiki:", value: theinfo["icwiki"], inline: false}]);
            if ("icp" in theinfo) embed.addField("IdleCorp Profit:", theinfo["icp"], false);
            img = "./images/info/blueprint.png";
            embed.addField("\u200b", ((icals["ic"]["blueprints"][reqsl])? "Aliases: "+icals["ic"]["blueprints"][reqsl].join(", "): "Aliases: None")+"\n\n\n[IdleCorp Wiki](https://wiki.idlecorp.xyz/index.php/{reqsl})", false);
        } else if (infoclass === "technologies") {
            if (techlv&&theinfo["upgrade"]["u".repeat(techlv)] === "None") return message.channel.send("`EN0004`: The technology has no \""+"u".repeat(techlv)+"\" upgrade.");
            embed.addFields([{name: "IdleCorp Info(Examine):", value: ((techlv)? 
                theinfo["upgrade"]["u".repeat(techlv)]["icinfo"]+"\nRarity: "+theinfo["rarity"]+"\nIt can be scrapped into "+theinfo["upgrade"]["u".repeat(techlv)]["scrap"]+" scraps\n\nAll technologies **can** trade and **cannot** be sold in the market and the retail stores respectively."+((techlv === 1&&theinfo["upgrade"]["uu"] !== "None")? "\n\nNext upgrade: "+reqsl.replaceAll("_", " ")+" uu": ""):
                theinfo["icinfo"]+"\n\nRarity: "+theinfo["rarity"]+"\nIt can be scrapped into "+theinfo["scrap"]+" scraps"+"\n\nAll technologies **can** trade and **cannot** be sold in the market and the retail stores respectively."+((theinfo["upgrade"]["u"] !== "None")? "\n\nNext upgrade: "+reqsl.replaceAll("_", " ")+" u": "")
                )+"The tech affected on "+StringHandlers.capitalize(theinfo["affect"]), inline: false},
                {name: "IdleCorp Wiki:", value: theinfo["icwiki"]+"\n\n"+theinfo["boost"].map((a, b) => "Level "+b+" boost: "+a.replace("+", "and")).join("\n"), inline: false}]);
            if ("icp" in theinfo) embed.addField("IdleCorp Profit:", theinfo["icp"], false);
            img = "./images/info/technology.png";
            embed.addField("\u200b", ((icals["ic"]["technologies"][reqsl+((techlv)? "_"+"u".repeat(techlv): "")])? "Aliases: "+icals["ic"]["technologies"][reqsl+((techlv)? "_"+"u".repeat(techlv): "")].join(", "): "Aliases: None")+"\n\n\n[IdleCorp Wiki](https://wiki.idlecorp.xyz/index.php/{reqsl})"+((theinfo["wikipedia"] !== "None")? "\n[Wikipedia](https://en.wikipedia.org/wiki/{reqsl})": ""), false);
        } else if (infoclass === "services") {
            embed.addField("IdleCorp Info(Examine):", theinfo["icinfo"]+"\nAffect: "+theinfo["effect"]+"\nCost: **${:,}**".format(theinfo["cost"]), false);
            if ("icp" in theinfo) embed.addField("IdleCorp Profit:", theinfo["icp"], false);
            img = "./images/info/crane.png";
            embed.addField("\u200b", ((icals["ic"]["services"][reqsl])? "Aliases: "+icals["ic"]["services"][reqsl].join(", "): "Aliases: None")+(
                (theinfo["wikipedia"] !== "None")? "\n\n[Wikipedia](https://en.wikipedia.org/wiki/"+reqsl+")": ""), false)
        } else if (infoclass === "pollicies") {
            embed.addField("IdleCorp Info(Examine):", "Affect: "+theinfo["affect"]+"\nCost: "+theinfo["cost"]+" *Funding points*", false);
            if ("icp" in theinfo) embed.addField("IdleCorp Profit:", theinfo["icp"], false);
            embed.addField("\u200b", ((icals["ic"]["policies"][reqsl])? "Aliases: "+", ".join(icals["ic"]["policies"][reqsl]): "Aliases: None")+(
                (theinfo["wikipedia"] !== "None")? "\n\n[Wikipedia](https://en.wikipedia.org/wiki/"+reqsl+")": ""), false)
        }
        if (!img) message.channel.send(embed);
        else {
            embed.setThumbnail("attachment://img.png");
            if (imgset) {
                imgset.then(() => {img = new Discord.MessageAttachment(img, "img.png");
                message.channel.send({embed: embed, files: [img]});})
            } else {
                img = new Discord.MessageAttachment(img, "img.png");
                message.channel.send({embed: embed, files: [img]});
            }
        }
    }
}