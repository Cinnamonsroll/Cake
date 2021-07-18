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
      color,
      messageEmojis,
      ws: { ping },
      guildDatabase,
      cakeCache
    },
    message,
    editedMessage,
  }) => {
    let firstMessage = await message.create("ping?", { editedMessage });
    await firstMessage.delete();
    let firstDbCall = Date.now()
    await guildDatabase.findOne({guild: message.guild.id})
    let firstCacheCall = Date.now()
    cakeCache.messages[message.channel.id][0]
    await message.create("", {
      embed: {
        color: Number("0x" + color.slice(1)),
        fields: [
          {
            name: "WebSocket",
            value: `${messageEmojis[ping > 200 ? "bad" : "good"]} ${ping}ms`,
          },
          {
            name: "Roundtrip",
            value: `${messageEmojis[firstMessage.created - message.created > 200 ? "bad" : "good"]} ${firstMessage.created - message.created}ms`,
          },
          {
            name: "Database",
            value: `${messageEmojis[Date.now() - firstDbCall > 200 ? "bad" : "good"]} ${ Date.now() - firstDbCall}ms`,
          },
          {
            name: "Cache",
            value: `${messageEmojis[Date.now() - firstCacheCall > 200 ? "bad" : "good"]} ${ Date.now() - firstCacheCall}ms`,
          },
        ],
      },
      editedMessage,
    });
  },
};
