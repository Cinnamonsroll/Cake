module.exports = {
  name: "ping",
  description: "Gets bot latency",
  slash: true,
  owner: false,
  category: "general",
  aliases: ["pong"],
  slashRun: async ({ client, respond }) => {
    respond(`Pong! \`${client.ws.ping}\`ms`);
  },
  run: async ({
    client: {
      ws: { ping },
    },
    message,
  }) => {
    message.create(`Pong! \`${ping}\`ms`, {
      reply: message.id,
    });
  },
};
