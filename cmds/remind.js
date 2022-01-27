const NumberHandlers = require("../funcs/NumberHandlers");
const fetch = require("node-fetch");

module.exports = {
    name: "remind",
    execute(message, args) {
        if (!args.length) return message.channel.send("`EN0001`: Missing parameter.")
        const time = NumberHandlers.timeAlias(args.shift());
        if (!time) return message.channel.send("`EN0002`: The time is invalid.");
        if (time<60) return message.channel.send("`EN0002`: The time is too small.");
        fetch("https://api.bit.io/api/v1beta/query/", {method: "POST", headers: {Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer 9Nen_UuTrFikB2Mpjw6r3ic3YVpd"}, body: JSON.stringify({query_string: `INSERT INTO \"BenChueng0422/IdleCorp-Profit\".\"reminder_lite\" VALUES (${Date.now()+(time)*1000}, \'${args.join(" ")}\', ${message.author.id})`})});
        message.channel.send("You will be reminded at <t:"+(~~(Date.now()/1000)+time)+">.")
    }
}