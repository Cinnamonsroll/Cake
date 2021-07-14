const Discord = require("discord.js");
let fetch = require("node-fetch");
let { parseButtons, parseDropdown } = require("./parser.js");
module.exports = class CakeMessage extends Discord.Message {
  constructor(client, data, channel) {
    super(client, data, channel);
    this.cache = client.cakeCache.messages?.[channel.id];
  }
  async delete() {
    if (this.deleted) return;
    await this.client.request(
      "DELETE",
      `/channels/${this.channel.id}/messages/${this.id}`
    );
    return this;
  }
  async edit(content, options = {}) {
    let message = await this.client
      .request("PATCH", `/channels/${this.channel.id}/messages/${this.id}`, {
        content: (String(content) || "").slice(0, 2000),
        embed: options.embed,
        components: options.components || [],
        allowed_mentions: {
          replied_user: false,
          parse: [],
        },
        message_reference: {
          message_id: options.reply,
        },
      })
      .then((res) => res.json());
    let m = message;
    m.guild = this.guild;
    return new this.constructor(this.client, m, this.channel);
  }
  async add_reaction(emoji) {
    let parseEmoji = (emoji) => {
      if (emoji.match(/^[0-9]+$/)) return `unknown:${emoji}`;
      return encodeURIComponent(emoji);
    };
    await this.client.request(
      "PUT",
      `/channels/${this.channel.id}/messages/${this.id}/reactions/${parseEmoji(
        emoji
      )}/@me`
    );
    return this;
  }
  async create(content, options = {}) {
    let sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    let buttons = parseButtons(options.buttons || []);
    let dropdowns = parseDropdown(options.dropdown || []);
    for (let button of buttons) {
      await this.client._addButton(
        this.channel.id,
        button.custom_id,
        button.callback,
        button.check,
        button.fail
      );
    }
    for (let dropdown of dropdowns) {
      await this.client._addDropdown(
        this.channel.id,
        dropdown.custom_id,
        dropdown.callback,
        dropdown.check,
        dropdown.fail
      );
    }
    let components = Array.from(
      {
        length: Math.ceil(buttons.length / (options.limit || 5)),
      },
      (a, r) =>
        buttons.slice(
          r * (options.limit || 5),
          r * (options.limit || 5) + (options.limit || 5)
        )
    ).map((x) => ({ type: 1, components: x }));
    components = components.length
      ? [
          ...components,
          dropdowns.length ? { type: 1, components: dropdowns } : undefined,
        ]
      : [];
    if (options.editedMessage)
      return await options.editedMessage.edit(content ?? "\u200b", {
        ...options,
        embed: options.embed ?? {},
        components: options.components || components.filter((x) => x) || [],
      });
    let message = await this.client
      .request("POST", `/channels/${this.channel.id}/messages`, {
        content: (String(content) || "").slice(0, 2000),
        embed: options.embed,
        components: options.components || components.filter((x) => x) || [],
        allowed_mentions: {
          replied_user: false,
          parse: [],
        },
        message_reference: {
          message_id: options.reply,
        },
      })
      .then((res) => res.json());
    let m = message;
    m.guild = this.guild;
    message = new this.constructor(this.client, m, this.channel);
    if (!options.editedMessage) this.client.cakeCache.set("messageMap", {
      type: "dict",
      sub: {
        name: this.id,
        type: "custom",
        value: message,
      },
    });
    if (options.reactions) {
      for (let reaction of options.reactions) {
        await message.add_reaction(reaction.emoji);
        await this.client._addReaction(
          message.channel.id,
          message.id,
          reaction
        );
        await sleep(2000);
        continue;
      }
    }
    return message;
  }
};
