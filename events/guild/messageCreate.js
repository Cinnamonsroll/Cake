const Discord = require("discord.js");
const argSystem = require("../../structures/args.js");
module.exports = async (client, message, editedMessage) => {
  message = client.handleMessage(message);
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
  let cooldowns = (name, cooldown) => {
    if (client.owners.includes(message.author.id)) return;
    client.cakeCache.set("cooldowns", {
      type: "dict",
      sub: {
        name: `${message.author.id}:${name}`,
        type: "custom",
        value: Date.now(),
      },
    });
    setTimeout(
      () => delete client.cakeCache.cooldowns[`${message.author.id}:${name}`],
      cooldown || 3000
    );
  };
  let checkCooldown = (name, cooldown) => {
    if ("cooldowns" in client.cakeCache && client.cakeCache.cooldowns[`${message.author.id}:${name}`]) {
      let cooldownTime = (
        (client.cakeCache.cooldowns[`${message.author.id}:${name}`] +
          (cooldown || 3000) -
          Date.now()) /
        1000
      ).toFixed(1);
      return `Please wait ${cooldownTime} seconds.`;
    }
  };
  let commandContext = {
    client,
    Discord,
    message,
    prefix,
    editedMessage,
    args,
  };
  let subCommand =
    cmd.subcommands &&
    args[0] &&
    client.resolveSubCommand(
      client,
      command.toLowerCase(),
      args[0].toLowerCase()
    )
      ? client.subcommand(client, args[0], command, cmd)
      : undefined;
  if (subCommand && subCommand.error)
    return await message.create(subCommand.error);
  let whichCommand = subCommand || cmd;
  if (whichCommand.permissions && client.permissions(message, whichCommand.permissions))
    return await message.create(client.permissions(message, whichCommand.permissions));
  commandContext = await argSystem(
    client,
    commandContext,
    subCommand ? args.slice(1) : args,
    whichCommand.args || [],
    message
  );
  if (commandContext.message) {
    if (checkCooldown(whichCommand.name, whichCommand.cooldown))
      return await message.create(
        checkCooldown(whichCommand.name, whichCommand.cooldown)
      );
    whichCommand.run(commandContext);
    cooldowns(whichCommand.name, whichCommand.cooldown);
  }
};