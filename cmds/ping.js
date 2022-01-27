module.exports = {
	name: "ping",
	execute(message, args) {
        message.channel.send("Ping/Latency: "+message.client.ws.ping+"ms");
    }
}