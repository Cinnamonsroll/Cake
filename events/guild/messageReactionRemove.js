module.exports = async (client, reaction, user) => {
    if (!client.cakeCache.reactions) return;
    let bucket = `${reaction.message.channel.id}:${reaction.message.id}:${reaction._emoji.name}`;
    let reactionData = client.cakeCache.reactions[bucket];
    if (!reactionData) return;
    if (!reactionData.check(user)) return;
    await reactionData.callback(reaction.message);
  };
  