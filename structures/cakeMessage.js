const Discord = require("discord.js");
let fetch = require("node-fetch");
let extendedMessage = Discord.Structures.extend("Message", Message => {
  class CakeMessage extends Discord.Message {
    constructor(client, data, channel) {
      super(client, data, channel);
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
      let message = await this.client.request(
        "PATCH",
        `/channels/${this.channel.id}/messages/${this.id}`,
        {
          content: (String(content) || "").slice(0, 2000),
          embed: options.embed,
          components: options.components || [],
          allowed_mentions: {
            replied_user: false,
            parse: []
          },
          message_reference: {
            message_id: options.reply
          }
        }
      ).then(res => res.json())
      let m = message;
      m.guild = this.guild;
      return new Discord.Message(this.client, m, this.channel);
    }
    async add_reaction(emoji) {
      let parseEmoji = emoji => {
        if (emoji.match(/^[0-9]+$/)) return `unknown:${emoji}`;
        return encodeURIComponent(emoji);
      };
      await this.client.request(
        "PUT",
        `/channels/${this.channel.id}/messages/${
          this.id
        }/reactions/${parseEmoji(emoji)}/@me`
      );
      return this;
    }
    async create(content, options = {}) {
      let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
      function parseButtons(buttons) {
        let returnButtons = [],
          styles = { success: 3, danger: 4, primary: 1, secondary: 2 };
        for (let button of buttons) {
          let buttonObject = {
            type: 2,
            style: styles[button.style],
            label: button.label || "\u200b",
            custom_id: button.id,
            disabled: !!button.clickable,
            callback: button.callback,
            check: button.check,
            fail: button.fail
          };

          if (button.emoji) {
            let { id: emojiId, name: emojiName } = Discord.Util.parseEmoji(
              button.emoji
            );
            buttonObject.emoji = { id: emojiId, name: emojiName };
          }
          returnButtons.push(buttonObject);
        }
        return returnButtons;
      }
      function parseDropdown(dropdown) {
        let options = [];
        for (let option of dropdown.options || []) {
          if (option.emoji) {
            let { id: emojiId, name: emojiName } = Discord.Util.parseEmoji(
              option.emoji
            );
            option.emoji = { id: emojiId, name: emojiName };
          }
          options.push(option);
        }
        return dropdown.id
          ? [
              {
                type: 3,
                custom_id: dropdown.id,
                disabled: !!dropdown.useable,
                callback: dropdown.callback,
                check: dropdown.check,
                fail: dropdown.fail,
                placeholder: dropdown.placeholder,
                options
              }
            ]
          : [];
      }
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
          length: Math.ceil(buttons.length / (options.limit || 5))
        },
        (a, r) =>
          buttons.slice(
            r * (options.limit || 5),
            r * (options.limit || 5) + (options.limit || 5)
          )
      ).map(x => ({ type: 1, components: x }));
      components =
        components && dropdowns.length
          ? [...components, { type: 1, components: dropdowns }]
          : dropdowns.length
          ? [{ type: 1, components: dropdowns }]
          : components
          ? [...components]
          : [];
      let message = await this.client
        .request("POST", `/channels/${this.channel.id}/messages`, {
          content: (String(content) || "").slice(0, 2000),
          embed: options.embed,
          components: options.components || components || [],
          allowed_mentions: {
            replied_user: false,
            parse: []
          },
          message_reference: {
            message_id: options.reply
          }
        })
        .then(res => res.json());
      let m = message;
      m.guild = this.guild;
      message = new Discord.Message(this.client, m, this.channel);
      
      if (options.reactions) {
        for (let reaction of options.reactions) {
          await message.add_reaction(reaction.emoji);
          await this.client._addReaction(message.channel.id, message.id, reaction);
          await sleep(2000);
          continue;
        }
      }
      return message;
    }
  }

  return CakeMessage;
});

Discord.Message = extendedMessage;
