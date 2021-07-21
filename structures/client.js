let { Client } = require("discord.js");
let Discord = require("discord.js");
const cakeMessage = require("./cakeMessage.js");
const cakeArray = require("./cakeArray.js");
function permName(bitfield = 0) {
  for (let key in Discord.Permissions.FLAGS)
    if (Discord.Permissions.FLAGS[key] == bitfield) return key;
  return null;
}
module.exports = class cakeClient extends Client {
  constructor(defaultPrefix, owners, baseOptions) {
    super(baseOptions);
    this.defaultPrefix = defaultPrefix;
    this.owners = owners;
    this.cakeCache = new (require("./cacheManager.js"))();
    this.cache = {};
    this.request = new (require("./request.js"))()
    this.commands = new cakeArray();
    this.color = "#FFFEFB";
    this.config = require("../config.json");
    this.guildDatabase = require("../database/guild.js");
    this.messageEmojis = {
      good: "<:good:849112655071150101>",
      bad: "<:badboi:788537874140233759>",
    };
    this.tags = require("./tags.js");
    this.pagination = require("./pagination.js");
    this.prefixes = require("./prefixes");
  }
  _addReaction(channelId, messageId, reaction) {
    let bucket = `${channelId}:${messageId}:${reaction.emoji}`;
    this.cakeCache.set("reactions", {
      type: "dict",
      sub: {
        name: bucket,
        type: "dict",
        value: {
          check: reaction.check,
          callback: reaction.callback,
        },
      },
    });
  }
  async getUser(message, query, author) {
    if (!query) return author ? message.member : undefined;
    message.guild.members.fetch({
      withPresences: true,
    });
    let joins = message.guild.members.cache
      .sort((a, b) => a.joinedTimestamp - b.joinedTimestamp)
      .array();
    return (
      message.guild.members.cache.get(query.replace(/[<@​!?>]/g, "")) ||
      message.guild.members.cache.find((m) =>
        [m.user.username, m.displayName, m.user.tag].some((e) =>
          e.toLowerCase().includes(query.toLowerCase())
        )
      ) ||
      joins[parseInt(query) - 1] ||
      (author ? message.member : undefined)
    );
  }
  async _addDropdown(channelId, dropdownId, callback, check, fail) {
    let bucket = `${channelId}:${dropdownId}`;
    this.cakeCache.set("dropdowns", {
      type: "dict",
      sub: {
        name: bucket,
        type: "custom",
        value: setTimeout(async (interaction) => {
          if (!interaction) return;
          if (
            !check(
              interaction.member ? interaction.member.user : interaction.user
            )
          )
            return await fail(interaction);
          return await callback(interaction, () => {
            if (!this.cakeCache.dropdowns[bucket]) return;
            clearTimeout(this.cakeCache.dropdowns[bucket]);
            delete this.cakeCache.dropdowns[bucket];
          });
        }, 900000),
      },
    });
  }
  permissions(message, perms) {
    for (const bitfield of perms.map((x) => Discord.Permissions.FLAGS[x])) {
      if (!message.member.permissions.has(bitfield, true))
        return `You are missing one of the following permissions ${perms
          .map((x) => Discord.Permissions.FLAGS[x])
          .filter((perm) => !message.member.permissions.has(perm, true))
          .map((perm) => `\`${permName(perm)}\``)
          .join(" | ")}`;
    }
  }
  subcommand(client, suspectedSubCommand, command, cmd) {
    let subcommandToReturn = client.resolveSubCommand(
      client,
      command,
      suspectedSubCommand
    );
    if (!subcommandToReturn)
      return {
        error: `Valid subcommands for the command \`${
          cmd.name
        }\` are ${cmd.subcommands.map((x) => `\`${x.name}\``).join(" | ")}`,
      };
    return subcommandToReturn;
  }
  resolveSubCommand(client, command, subcommand) {
    let resolveCommand = client.resolveCommand(command);
    if (!resolveCommand) return undefined;
    let resolvedSubCommand = resolveCommand.subcommands.find(
      (x) =>
        x.name === subcommand || (x.aliases && x.aliases.includes(subcommand))
    );
    return resolvedSubCommand || undefined;
  }
  async _addButton(channelId, buttonId, callback, check, fail) {
    let bucket = `${channelId}:${buttonId}`;
    this.cakeCache.set("buttons", {
      type: "dict",
      sub: {
        name: bucket,
        type: "custom",
        value: setTimeout(async (interaction) => {
          if (!interaction) return;
          if (
            !check(
              interaction.member ? interaction.member.user : interaction.user
            )
          )
            return await fail(interaction);
          return await callback(interaction, () => {
            if (!this.cakeCache.dropdowns[bucket]) return;
            clearTimeout(this.cakeCache.dropdowns[bucket]);
            delete this.cakeCache.dropdowns[bucket];
          });
        }, 900000),
      },
    });
  }
  resolveCommand(query) {
    let command = this.commands.find(
      (x) => x.name === query || (x.aliases && x.aliases.includes(query))
    );
    return command || undefined;
  }
  async request(method, url, options = {}) {
    if(!options.notDiscord) url = `https://discord.com/api/v9${url}`
    let fetch = require("node-fetch");
    let res;
    if (method === "GET" || method === "DELETE") {
      res = await fetch(`${url}`, {
        method,
        headers: {
          Authorization: `Bot ${this.config.token}`,
          "User-Agent": `DiscordBot`,
          "Content-Type": "application/json",
        },
      });
    } else {
      res = await fetch(`${url}`, {
        method,
        headers: options.headers
          ? options.headers
          : {
              Authorization: `Bot ${this.config.token}`,
              "User-Agent": `DiscordBot`,
              "Content-Type": "application/json",
            },
        body: JSON.stringify(options.body ? options.body : options),
      });
    }

    const contentType = res.headers["content-type"];

    return contentType && contentType.includes("application/json")
      ? res.json()
      : res;
  }
  getCategories(message) {
    return [...new Set(this.commands.map((x) => x.category))].filter((x) =>
      this.owners.includes(message.author.id) ? x : x !== "owner"
    );
  }
  async getPrefixes(guildId) {
    if ("prefixes" in this.cakeCache && this.cakeCache.prefixes[guildId])
      return this.cakeCache.prefixes[guildId];
    let guildData = await this.guildDatabase.findOne({ guild: guildId });
    if (!guildData)
      guildData = await this.guildDatabase.create({ guild: guildId });
    this.cakeCache.set("prefixes", {
      type: "dict",
      sub: {
        name: guildId,
        type: "list",
        value: guildData.prefixes.length
          ? guildData.prefixes
          : this.defaultPrefix,
      },
    });
    return this.cakeCache.prefixes[guildId];
  }
  handleMessage(message) {
    const m = message.toJSON();
    m.guild = message.guild;
    m.author = message.author;
    message = new cakeMessage(this, m, message.channel);
    this.cakeCache.add("messages", {
      type: "dict",
      front: true,
      max: 9,
      sub: {
        name: message.channel.id,
        type: "list",
        value: message,
      },
    });
    return message;
  }
  setupDatabase(mongouri) {
    let mongoose = require("mongoose");
    mongoose.connect(mongouri, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log("Database connected");
    return this;
  }
  loadCommands(categories) {
    if (!categories || !Array.isArray(categories))
      throw new Error("Invalid categories array provided");
    new (require("./commandHandler"))().load("./commands", categories, this);
    return this;
  }
  loadEvents(categories) {
    if (!categories || !Array.isArray(categories))
      throw new Error("Invalid categories array provided");
    new (require("./eventHandler"))().load("./events", categories, this);
    return this;
  }
  run(token) {
    if (!token || typeof token !== "string")
      throw new Error("Please include a token");
    this.login(token);
    return this;
  }
};
