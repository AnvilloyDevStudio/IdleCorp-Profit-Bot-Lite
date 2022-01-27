const setting = require("../setting.json");
const fs = require("fs");

module.exports = {
	name: "ready",
	once: true,
	execute(client) {
		console.log("Ready");
		fs.readdir("./loops", (e, f) => {for (const a of f) require("../loops/"+a)(client)});
		client.user.setPresence({activity: {name: "Version: "+setting["version"]+" | +-help", type: "WATCHING"}})
	},
};