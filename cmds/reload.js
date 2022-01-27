const fs = require('fs');
const cmdInfo = require("../cmdsinfo.json");

module.exports = {
	name: "reload",
	execute(message, args) {
        if (!message.member.roles.cache.findKey((a, b) => ["841622372351344650", "801052590389329930", "801052697498746920"].includes(b))) return message.channel.send("`EN0111`: You don't have enough permission.");
        const commandName = args.shift()?.toLowerCase();
		const command = message.client.commands.get(commandName)  || message.client.commands.find(cmd => cmdInfo["aliases"][cmd.name] && cmdInfo["aliases"][cmd.name]["_index"].includes(commandName));

		if (!command) return message.channel.send(`\`EN0002\`: Invalid command \`${commandName}\`.`);
        if (args.length) {
            let newarg = [];
            while (args.length) {
                let check = newarg.length && newarg.reduce((a, b) => a[b], cmdInfo["aliases"][command.name]) || cmdInfo["aliases"][command.name]
                args = args.map((a, b) => (!b)? Object.entries(check).find(b => b[1].includes(a))?.[0] || a: a);
                if (!check[args[0]]) return message.channel.send("`EN0002`: The command was invalid.");
                newarg.push(args.shift())
            }
            delete require.cache[require.resolve(`./expan/${command.name}/${newarg.join("/")}.js`)];
            return message.channel.send("Deleted the cache of the command.")
        }
        delete require.cache[require.resolve(`./${command.name}.js`)];
        try {
            const newCommand = require(`./${command.name}.js`);
            message.client.commands.set(newCommand.name, newCommand);
            message.channel.send(`Command \`${newCommand.name}\` has reloaded.`);
        } catch (error) {
            console.error(error);
            message.channel.send(`Cannot reload \`${command.name}\`:\n\`${error.message}\``);
        }
	},
};