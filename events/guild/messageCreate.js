const Discord = require("discord.js");
const cakeMessage = require("../../structures/cakeMessage.js");
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
  message = new cakeMessage(client, m, message.channel);
  client.cakeCache.add("messages", {
    type: "dict",
    front: true,
    max: 9,
    sub: {
      name: message.channel.id,
      type: "list",
      value: message,
    },
  });
  if (!message.guild || message.author.bot || message.channel.type === "dm")
    return;
  let realPrefix = await client.getPrefixes(message.guild.id);
  await client.tags.cache(client, message, false);
  let escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\\`]/g, "\\$&");
  let prefixRegex = new RegExp(
    `^(<@!?${client.user.id}>|${
      Array.isArray(realPrefix) && realPrefix.length > 0
        ? realPrefix.map((x) => escapeRegex(x.prefix)).join("|")
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
    guild: message.guild.id,
  });
  let commandContext = {
    client,
    Discord,
    message,
    prefix,
    args,
  };
  if (cmd.permissions) {
    for (const bitfield of cmd.permissions.map(
      (x) => Discord.Permissions.FLAGS[x]
    )) {
      if (!message.member.permissions.has(bitfield, true))
        return await message.create(
          `You are missing one of the following permissions ${cmd.permissions
            .map((x) => Discord.Permissions.FLAGS[x])
            .filter((perm) => !message.member.permissions.has(perm, true))
            .map((perm) => `\`${permName(perm)}\``)
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
        `Valid subcommands for the command \`${cmd.name}\` are ${cmd.subcommands
          .map((x) => `\`${x.name}\``)
          .join(" | ")}`
      );
    if (subCommand.permissions) {
      for (const bitfield of subCommand.permissions.map(
        (x) => Discord.Permissions.FLAGS[x]
      )) {
        if (!message.member.permissions.has(bitfield, true))
          return await message.create(
            `You are missing one of the following permissions ${subCommand.permissions
              .map((x) => Discord.Permissions.FLAGS[x])
              .filter((perm) => !message.member.permissions.has(perm, true))
              .map((perm) => `\`${permName(perm)}\``)
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
    if (commandContext.message) {
      if (
        "cooldowns" in client.cakeCache &&
        client.cakeCache.cooldowns[message.author.id] &&
        client.cakeCache.cooldowns[message.author.id][subCommand.name]
      ) {
        let cooldownTime = (
          (client.cakeCache.cooldowns[message.author.id][subCommand.name] +
            (subCommand.cooldown || 3000) -
            Date.now()) /
          1000
        ).toFixed(1);
        return await message.create(`Please wait ${cooldownTime} seconds.`);
      }
      subCommand.run(commandContext);
      let obj = {};
      obj[subCommand.name] = Date.now();
      client.cakeCache.set("cooldowns", {
        type: "dict",
        sub: {
          name: message.author.id,
          type: "custom",
          value: obj,
        },
      });
      setTimeout(
        () =>
          delete client.cakeCache.cooldowns[message.author.id][subCommand.name],
        subCommand.cooldown || 3000
      );
    }
  } else {
    commandContext = await argSystem(
      client,
      commandContext,
      args,
      cmd.args || [],
      message
    );
    if (commandContext.message) {
      if (
        "cooldowns" in client.cakeCache &&
        client.cakeCache.cooldowns[message.author.id] &&
        client.cakeCache.cooldowns[message.author.id][cmd.name]
      ) {
        let cooldownTime = (
          (client.cakeCache.cooldowns[message.author.id][cmd.name] +
            (cmd.cooldown || 3000) -
            Date.now()) /
          1000
        ).toFixed(1);
        return await message.create(`Please wait ${cooldownTime} seconds.`);
      }
      cmd.run(commandContext);
      let obj = {};
      obj[cmd.name] = Date.now();
      client.cakeCache.set("cooldowns", {
        type: "dict",
        sub: {
          name: message.author.id,
          type: "custom",
          value: obj,
        },
      });
      setTimeout(
        () => delete client.cakeCache.cooldowns[message.author.id][cmd.name],
        cmd.cooldown || 3000
      );
    }
  }
};
