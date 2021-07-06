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
        time: 60000
      }
    ],
    run: async ({ client, message, evalCode, prefix }) => {
      let { inspect } = require("util"),
        { Type } = require("@sapphire/type"), coolThings = new (require("string-toolkit"))().parseOptions(evalCode.split(" "))
      let code = coolThings.contentNoOptions.replace(/\`\`\`(\w+)?/g, "");
      try {
        let evaled = eval(code);
        if (evaled && evaled instanceof Promise) evaled = await evaled;
        let type = new Type(evaled).toString();
  
        if (typeof evaled !== "string")
          evaled = inspect(evaled, {
            depth: parseInt(coolThings.options.depth || coolThings.options.d || 0)
          });
  
        evaled = evaled
          .replace(/`/g, `\`${String.fromCharCode(8203)}`)
          .replace(/@/g, `@${String.fromCharCode(8203)}`);
        let stringTools = new (require("string-toolkit"))();
        let hrStart = process.hrtime();
        let hrDiff;
        hrDiff = process.hrtime(hrStart);
        let evalEmbeds = stringTools.toChunks(evaled, 2000).map(thing => ({
          color: Number("0x" + client.color.slice(1)),
          description: `\`\`\`js\n${thing}\`\`\``,
          fields: [
            { name: "Type of", value: `\`\`\`js\n${type}\`\`\`` },
            {
              name: "Time",
              value: `\`\`\`css\n${
                hrDiff[0] > 0 ? `${hrDiff[0]}s` : ""
              }${hrDiff[1] / 1000}ms\`\`\``
            }
          ]
        }));
        await client.pagination(message, {
          embeds: evalEmbeds,
          dropdown: evalEmbeds.slice(0, 25),
          page: true
        });
      } catch (err) {
        return message.create("", {
          embed: {
            color: Number("0x" + client.color.slice(1)),
            title: "Error",
            description: `\`\`\`js\n ${err.message.replace(/(require(\s+)stack(:)([\s\S]*))?/gim, "")}\`\`\``
          },
          reply: message.id
        });
      }
    }
  };
  