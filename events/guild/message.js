const Discord = require("discord.js");
const { Message } = require("discord.js");
const argSystem = require("../../structures/args.js");
function permName(bitfield = 0) {
  for (let key in Discord.Permissions.FLAGS)
    if (Discord.Permissions.FLAGS[key] == bitfield) return key;
  return null;
}
module.exports = async (client, message) => {
  const m = message.toJSON();
  m.guild = message.guild;
  m.author = message.author;
  message = new Message(client, m, message.channel);
  if (!message.guild || message.author.bot || message.channel.type === "dm")
    return;
  let realPrefix = await client.getPrefixes(message.guild.id);
  await client.tags.cache(client, message, false);
  let escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\\`]/g, "\\$&");
  let prefixRegex = new RegExp(
    `^(<@!?${client.user.id}>|${
      Array.isArray(realPrefix) && realPrefix.length > 0
        ? realPrefix.map(x => escapeRegex(x.prefix)).join("|")
        : realPrefix
    }|${client.user.username})`,
    "gi"
  );
  if (!prefixRegex.test(message.content.trim())) return;
  let prefix = message.content.match(prefixRegex)[0];
  let [command, ...args] = message.content
    .slice(prefix.length)
    .trim()
    .split(/ +/g);
  let cmd = client.resolveCommand(command.toLowerCase());
  if (!cmd || (cmd.owner && !client.owners.includes(message.author.id))) return;
  const guildData = await client.guildDatabase.findOne({
    guild: message.guild.id
  });
  let commandContext = {
    client,
    Discord,
    message,
    prefix,
    args
  };
  if (cmd.permissions) {
    for (const bitfield of cmd.permissions.map(
      x => Discord.Permissions.FLAGS[x]
    )) {
      if (!message.member.permissions.has(bitfield, true))
        return await message.create(
          `You are missing one of the following permissions ${cmd.permissions
            .map(x => Discord.Permissions.FLAGS[x])
            .filter(perm => !message.member.permissions.has(perm, true))
            .map(perm => `\`${permName(perm)}\``)
            .join(" | ")}`
        );
    }
  }
  if (
    cmd.subcommands &&
    args[0] &&
    client.resolveSubCommand(
      client,
      command.toLowerCase(),
      args[0].toLowerCase()
    )
  ) {
    let subCommand = client.resolveSubCommand(
      client,
      command.toLowerCase(),
      args[0].toLowerCase()
    );
    if (!subCommand)
      return await message.create(
        `Valid subcommands for the command \`${
          cmd.name
        }\` are ${cmd.subcommands.map(x => `\`${x.name}\``).join(" | ")}`
      );
    if (subCommand.permissions) {
      for (const bitfield of subCommand.permissions.map(
        x => Discord.Permissions.FLAGS[x]
      )) {
        if (!message.member.permissions.has(bitfield, true))
          return await message.create(
            `You are missing one of the following permissions ${subCommand.permissions
              .map(x => Discord.Permissions.FLAGS[x])
              .filter(perm => !message.member.permissions.has(perm, true))
              .map(perm => `\`${permName(perm)}\``)
              .join(" | ")}`
          );
      }
    }
    commandContext = await argSystem(
      client,
      commandContext,
      args.slice(1),
      subCommand.args || [],
      message
    );
    if (
      Array.isArray(realPrefix) &&
      realPrefix.length > 0 &&
      realPrefix.find(x => x.prefix === prefix)
    ) {
      let prefixData = guildData.prefixes.find(x => x.prefix === prefix);
      prefixData.uses++
      await client.guildDatabase.updateOne({guild: message.guild.id}, {$set: guildData})
      client.cache.prefix[`prefix.${message.guild.id}`] = guildData.prefixes;
    }
    subCommand.run(commandContext);
  } else {
    commandContext = await argSystem(
      client,
      commandContext,
      args,
      cmd.args || [],
      message
    );
    if (
      Array.isArray(realPrefix) &&
      realPrefix.length > 0 &&
      realPrefix.find(x => x.prefix === prefix)
    ) {
      let prefixData = guildData.prefixes.find(x => x.prefix === prefix);
      prefixData.uses++;
      await client.guildDatabase.updateOne({guild: message.guild.id}, {$set: guildData})
      client.cache.prefix[`prefix.${message.guild.id}`] = guildData.prefixes;
    }
    cmd.run(commandContext);
  }
};
