let { MessageAttachment } = require("discord.js");
module.exports = {
  name: "eval",
  description: "Evals code",
  slash: false,
  owner: true,
  category: "owner",
  aliases: ["e"],
  args: [
    {
      question: "What code do you want to eval?",
      type: "string",
      key: "evalCode",
      joined: true,
      time: 60000,
    },
  ],
  run: async ({ client, message, evalCode, prefix, editedMessage }) => {
    let { inspect } = require("util"),
      { Type } = require("@sapphire/type"),
      coolThings = new (require("string-toolkit"))().parseOptions(
        evalCode.split(" ")
      ),
      { performance } = require("perf_hooks"),
      puppeteer = require("puppeteer");
    let code = coolThings.contentNoOptions.replace(/`{3}(\w+)?/g, "");
    if (coolThings.flags.includes("html") || coolThings.flags.includes("h") || evalCode.match(/(`{3})(html)/gi) || evalCode.match(/(<([^>]+)>)/gi)) {
      const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
      const page = await browser.newPage();
      page.setContent(code);
      let screenshot = await page.screenshot({fullpage:true})
      await browser.close();
      let attachment = new MessageAttachment(screenshot,'html.png')
      return await message.channel.send({files: [attachment]})
    }
    try {
      let time = performance.now();
      let evaled = eval(code);
      if (evaled && evaled instanceof Promise) evaled = await evaled;
      let type = new Type(evaled).toString();

      if (typeof evaled !== "string")
        evaled = inspect(evaled, {
          depth: parseInt(
            coolThings.options.depth || coolThings.options.d || 0
          ),
        });

      evaled = evaled
        .replace(/`/g, `\`${String.fromCharCode(8203)}`)
        .replace(/@/g, `@${String.fromCharCode(8203)}`);
      let stringTools = new (require("string-toolkit"))();
      let evalEmbeds = stringTools.toChunks(evaled, 2000).map((thing) => ({
        color: Number("0x" + client.color.slice(1)),
        description: `\`\`\`js\n${thing}\`\`\``,
        fields: [
          { name: "Type of", value: `\`\`\`js\n${type}\`\`\`` },
          {
            name: "Time",
            value: `\`\`\`css\n${performance.now() - time}ms\`\`\``,
          },
        ],
      }));
      await client.pagination(message, {
        embeds: evalEmbeds,
        dropdown: evalEmbeds.slice(0, 25),
        page: true,
        editedMessage,
      });
    } catch (err) {
      return message.create("", {
        embed: {
          color: Number("0x" + client.color.slice(1)),
          title: "Error",
          description: `\`\`\`js\n ${err.message.replace(
            /(require(\s+)stack(:)([\s\S]*))?/gim,
            ""
          )}\`\`\``,
        },
        reply: message.id,
        editedMessage,
      });
    }
  },
};
