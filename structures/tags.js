let guildDatabase = require("../database/guild.js");
module.exports = {
  async cache(client, message, updating) {
    if (
      "tags" in client.cache &&
      client.cache.tags[`tags.${message.guild.id}`] &&
      !updating
    )
      return;
    else {
      if ("tags" in client.cache)
        client.cache.tags[
          `tags.${message.guild.id}`
        ] = await client.tags.getTags(message);
      else {
        client.cache.tags = {};
        client.cache.tags[
          `tags.${message.guild.id}`
        ] = await client.tags.getTags(message);
      }
    }
  },
  async getTags(message) {
    let guildData = await guildDatabase.findOne({
      guild: message.guild.id
    });
    return guildData.tags;
  },
  async renameTag(client, name, newName, tag, message) {
    let guildData = await guildDatabase.findOne({
      guild: message.guild.id
    });
    guildData.tags = [
      ...guildData.tags.filter(x => x.name.toLowerCase() !== name),
      {
        name: newName,
        content: tag.content,
        aliases: tag.aliases,
        date: tag.date,
        owner: tag.owner
      }
    ];
    await guildData.save();
    await client.tags.cache(client, message, true);
  },
  async deleteTag(client, tag, message) {
    let guildData = await guildDatabase.findOne({
      guild: message.guild.id
    });
    guildData.tags = guildData.tags.filter(x => x.name !== tag.name);
    await guildData.save();
    await client.tags.cache(client, message, true);
  },
  async addAlias(client, name, alias, tag, message) {
    let guildData = await guildDatabase.findOne({
      guild: message.guild.id
    });
    guildData.tags = [
      ...guildData.tags.filter(x => x.name.toLowerCase() !== name),
      {
        name,
        content: tag.content,
        aliases: [...tag.aliases, alias],
        date: tag.date,
        owner: tag.owner
      }
    ];
    await guildData.save();
    await client.tags.cache(client, message, true);
  },
  async editTag(client, name, content, tag, message) {
    let guildData = await guildDatabase.findOne({
      guild: message.guild.id
    });
    guildData.tags = [
      ...guildData.tags.filter(x => x.name.toLowerCase() !== name),
      {
        name,
        content,
        aliases: tag.aliases,
        date: tag.date,
        owner: tag.owner
      }
    ];
    await guildData.save();
    await client.tags.cache(client, message, true);
  },
  async createTag(client, name, content, message) {
    let guildData = await guildDatabase.findOne({
      guild: message.guild.id
    });
    guildData.tags.push({
      name,
      content,
      aliases: [],
      date: Date.now(),
      owner: message.member.id
    });
    await guildData.save();
    await client.tags.cache(client, message, true);
  },
  async findTag(client, query, guild) {
    let tag = client.cache.tags[`tags.${guild}`].find(
      x =>
        x.name.toLowerCase() === query.toLowerCase() ||
        x.aliases.map(y => y.toLowerCase()).includes(query.toLowerCase())
    );
    return tag || undefined;
  }
};
