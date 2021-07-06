module.exports = async (client, reaction, user) => {
  if (!client.cache.reactions) return;
  let bucket = `${reaction.message.channel.id}:${reaction.message.id}:${reaction._emoji.name}`;
  let reactionData = client.cache.reactions[bucket];
  if (!reactionData) return;
  if (!reactionData.check(user)) return;
  await reactionData.callback(reaction.message);
};
