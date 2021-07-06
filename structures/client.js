let { Client, Collection, Message, Util } = require("discord.js");
require("./cakeMessage");
module.exports = class baseClient extends Client {
  constructor(defaultPrefix, owners, baseOptions) {
    super(baseOptions);
    this.defaultPrefix = defaultPrefix;
    this.owners = owners;
    this.cache = {};
    this.commands = [];
    this.color = "#FFFEFB";
    this.config = require("../config.json");
    this.guildDatabase = require("../database/guild.js");
    this.messageEmojis = {
      good: "<:good:849112655071150101>",
      bad: "<:badboi:788537874140233759>"
    };
    this.tags = require("./tags.js")
    this.pagination = require("./pagination.js")
    this.prefixes = require("./prefixes")
  }
  _addReaction(channelId, messageId, reaction) {
    let bucket = `${channelId}:${messageId}:${reaction.emoji}`;
    if(!this.cache.reactions) this.cache.reactions = {}
    this.cache.reactions[bucket] = {
      check: reaction.check,
      callback: reaction.callback
    };
  }
  async getUser(message, query, author) {
    if (!query) return author ? message.member : undefined;
    message.guild.members.fetch({
      withPresences: true
    });
    let joins = message.guild.members.cache
      .sort((a, b) => a.joinedTimestamp - b.joinedTimestamp)
      .array();
    return (
      message.guild.members.cache.get(query.replace(/[<@​!?>]/g, "")) ||
      message.guild.members.cache.find(m =>
        [m.user.username, m.displayName, m.user.tag].some(e =>
          e.toLowerCase().includes(query.toLowerCase())
        )
      ) ||
      joins[parseInt(query) - 1] ||
      (author ? message.member : undefined)
    );
  }
  async _addDropdown(channelId, dropdownId, callback, check, fail) {
    let bucket = `${channelId}:${dropdownId}`;
    if (!this.cache.dropdowns) this.cache.dropdowns = {};
    this.cache.dropdowns[bucket] = setTimeout(async interaction => {
      if (!interaction) return;
      if (
        !check(interaction.member ? interaction.member.user : interaction.user)
      )
        return await fail(interaction);
      return await callback(interaction, () => {
        if (!this.cache.dropdowns[bucket]) return;
        clearTimeout(this.cache.dropdowns[bucket]);
        delete this.cache.dropdowns[bucket];
      });

      clearTimeout(this.cache.dropdowns[bucket]);
      delete this.cache.dropdowns[bucket];
    }, 900000);
  }
  resolveSubCommand(client, command, subcommand) {
    let resolveCommand = client.resolveCommand(command);
    if (!resolveCommand) return undefined;
    let resolvedSubCommand = resolveCommand.subcommands.find(
      x =>
        x.name === subcommand || (x.aliases && x.aliases.includes(subcommand))
    );
    return resolvedSubCommand || undefined;
  }
  async _addButton(channelId, buttonId, callback, check, fail) {
    let bucket = `${channelId}:${buttonId}`;
    if (!this.cache.buttons) this.cache.buttons = {};
    this.cache.buttons[bucket] = setTimeout(async interaction => {
      if (!interaction) return;
      if (
        !check(interaction.member ? interaction.member.user : interaction.user)
      )
        return await fail(interaction);
      return await callback(interaction, () => {
        if (!this.cache.buttons[bucket]) return;
        clearTimeout(this.cache.buttons[bucket]);
        delete this.cache.buttons[bucket];
      });

      clearTimeout(this.cache.buttons[bucket]);
      delete this.cache.buttons[bucket];
    }, 900000);
  }
  resolveCommand(query) {
    let command = this.commands.find(
      x => x.name === query || (x.aliases && x.aliases.includes(query))
    );
    return command || undefined;
  }
  async request(method, url, body = {}) {
    let fetch = require("node-fetch");
    let res;
    if (method === "GET" || method === "DELETE") {
      res = await fetch(`https://discord.com/api/v9${url}`, {
        method,
        headers: {
          Authorization: `Bot ${this.config.token}`,
          "User-Agent": `DiscordBot`,
          "Content-Type": "application/json"
        }
      });
    } else {
      res = await fetch(`https://discord.com/api/v9${url}`, {
        method,
        headers: {
          Authorization: `Bot ${this.config.token}`,
          "User-Agent": `DiscordBot`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
    }

    const contentType = res.headers["content-type"];

    return contentType && contentType.includes("application/json")
      ? res.json()
      : res;
  }
  getCategories(message) {
    return [...new Set(this.commands.map(x => x.category))].filter(x =>
      this.owners.includes(message.author.id) ? x : x !== "owner"
    );
  }
  async getPrefixes(guildId) {
    if ("prefix" in this.cache && this.cache.prefix[`prefix.${guildId}`])
      return this.cache.prefix[`prefix.${guildId}`];
    let guildData = await this.guildDatabase.findOne({ guild: guildId });
    if (!guildData)
      guildData = await this.guildDatabase.create({ guild: guildId });
    if (!("prefix" in this.cache)) this.cache.prefix = {};
    this.cache.prefix[`prefix.${guildId}`] = guildData.prefixes.length > 0 ? guildData.prefixes : this.defaultPrefix;
    return this.cache.prefix[`prefix.${guildId}`];
  }
  

  setupDatabase(mongouri) {
    let mongoose = require("mongoose");
    mongoose.connect(mongouri, {
      useUnifiedTopology: true,
      useNewUrlParser: true
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