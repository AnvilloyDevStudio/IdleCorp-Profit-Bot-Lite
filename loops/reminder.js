const fetch = require("node-fetch")
const Discord = require("discord.js");
const StringHandlers = require("../funcs/StringHandlers");

module.exports = (client) => {
    const int = setInterval(() => {
        try {
            fetch("https://api.bit.io/api/v1beta/query/", {method: "POST", headers: {Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer 9Nen_UuTrFikB2Mpjw6r3ic3YVpd"}, body: JSON.stringify({query_string: "SELECT * FROM \"BenChueng0422/IdleCorp-Profit\".\"reminder_lite\""})}).then(d => d.json()).then(dt => {
                const t = Date.now();
                dt["data"].filter(a => t>=a[0]).map(a => {
                    const u = client.users.cache.get(a[2]);
                    if (!u.dmChannel) u.createDM().then(c => c.send("Reminder: "+(a[1]||"No value")));
                    else u.dmChannel.send("Reminder: "+(a[1]||"No value"));
                })
                fetch("https://api.bit.io/api/v1beta/query/", {method: "POST", headers: {Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer 9Nen_UuTrFikB2Mpjw6r3ic3YVpd"}, body: JSON.stringify({query_string: "DELETE FROM \"BenChueng0422/IdleCorp-Profit\".\"reminder_lite\" WHERE time <= "+t+";"})}).catch(e => {
                    clearInterval(int);
                    console.error(e)
                })
            }).catch(e => {
                clearInterval(int);
                console.error(e)
            })
        } catch (error) {
            clearInterval(int);
            console.error(error)
        }
    }, 2000);
}