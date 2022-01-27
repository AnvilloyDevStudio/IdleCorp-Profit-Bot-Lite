const fs = require('fs');
const Discord = require("discord.js");
const client = new Discord.Client({ws: {intents: Discord.Intents.ALL}});
const prefix = "+-";
const cmdInfo = require("./cmdsinfo.json");
const Fraction = require("fraction.js");
const setting = require("./setting.json");
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./cmds').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	if (setting.load_blacklist.includes(file)) continue;
	const command = require(`./cmds/${file}`);
	client.commands.set(command.name, command);
}

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client));
	}
}

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});
client.on('shardError', error => {
	console.error('A websocket connection encountered an error:', error);
});

client.on("message", message => {
    if (message.author.bot||!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();
	let check;
	if (["=+", "=*", "=o"].includes(commandName)) {
		check = "calculate";
		args.unshift(commandName[1]);
	} else {
		check = undefined;
	}
	const command = client.commands.get(commandName) || client.commands.get(check) || client.commands.find(cmd => cmdInfo["aliases"][cmd.name] && cmdInfo["aliases"][cmd.name]["_index"].includes(commandName));
	const options = {"prefix": prefix, "client": client}

    if (!command) {
        message.channel.send((!commandName)? "`EN2001`: Missing command.": "`EN2002`: Invalid command.");
        return;
    }
    try {
		const fs = require("fs/promises");
		fs.readdir("./icdetailvers/").then(s => {
			for (const a of s) delete require.cache[require.resolve("./icdetailvers/"+a)];
			command.execute(message, args, options);
		}).catch(error => {
			const timestamp = Date.now()
			const date = Date(timestamp);
			let errorcode;
			if (error.message.match(/\w+\.replaceAll is not a function/)) errorcode = "EN2211"
			else if (error.message.match(/FetchError: invalid json response body at https:\/\/api\.bit\.io\/api\/v1beta\/query\/ reason: Unexpected token < in JSON at position 1/)) errorcode = "EN2221"
			console.error(`Timestamp: ${timestamp.toString(16)} (${date}): `+error);
			if (errorcode) return message.channel.send("A detected error: `"+errorcode+"`.");
			message.channel.send("`EN2011`: Detected an unexpected or unhandled error, timestamp: "+timestamp.toString(16));
		})
	} catch (error) {
		const timestamp = Date.now()
		const date = Date(timestamp);
		let errorcode;
		if (error.message.match(/\w+\.replaceAll is not a function/)) errorcode = "EN2211"
		else if (error.message.match(/FetchError: invalid json response body at https:\/\/api\.bit\.io\/api\/v1beta\/query\/ reason: Unexpected token < in JSON at position 1/)) errorcode = "EN2221"
		console.error(`Timestamp: ${timestamp.toString(16)} (${date}): `+error);
		if (errorcode) return message.channel.send("A detected error: `"+errorcode+"`.");
		message.channel.send("`EN2011`: Detected an unexpected or unhandled error, timestamp: "+timestamp.toString(16));
	}
});

client.login((fs.existsSync("./VSCodemark"))? "ODQwNTI3OTU3OTAxNDQzMDgy.YJZgqQ.8tLNlFkV-uN-y5QDQ3e70NxLLsM": setting["Token"]);