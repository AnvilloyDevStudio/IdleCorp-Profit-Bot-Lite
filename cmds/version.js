const setting = require("../setting.json");

module.exports = {
	name: "version",
	execute(message, args) {
        message.channel.send("The current bot version: "+setting["version"]);
    }
}