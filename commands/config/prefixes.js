module.exports = {
  name: "prefixes",
  description: "Show all current prefixes in the server.",
  slash: false,
  owner: false,
  category: "config",
  aliases: ["prefix"],
  subcommands: [
    {
      name: "delete",
      aliases: ["remove"],
      permissions: ["MANAGE_MESSAGES"],
      description: "Deletes a prefix",
      args: [
        {
          question: "What prefix do you want to delete?",
          type: "string",
          key: "prefix",
          joined: true
        }
      ],
      run: async ({ message, client, prefix }) => {
        const guildData = await client.guildDatabase.findOne({
          guild: message.guild.id
        });
        if (!client.prefixes.validate(guildData, prefix))
          return await message.create("Prefix doesn't exists");
        await client.prefixes.remove(guildData, client, message, prefix);
        await client
          .resolveCommand("prefixes")
          .run({ message, client, reason: `Remove prefix: ${prefix}` });
      }
    },
    {
      name: "add",
      permissions: ["MANAGE_MESSAGES"],
      description: "Add a prefix",
      args: [
        {
          question: "What prefix do you want to add?",
          type: "string",
          key: "prefix",
          joined: true
        }
      ],
      run: async ({ message, client, prefix }) => {
        const guildData = await client.guildDatabase.findOne({
          guild: message.guild.id
        });
        if (client.prefixes.validate(guildData, prefix))
          return await message.create("Prefix already exists");
        await client.prefixes.create(guildData, client, message, prefix);
        await client.resolveCommand("prefixes").run({ message, client });
      }
    }
  ],
  run: async ({ message, client, reason }) => {
    let prefixes = await client.getPrefixes(message.guild.id);
    await message.create("", {
      embed: {
        author: {
          name: message.author.tag,
          url: `https://discord.com/users/${message.member.id}`,
          icon_url: message.author.displayAvatarURL()
        },
        color: Number("0x" + client.color.slice(1)),
        title: `${reason ?? "Showing prefixes"}`,
        description:
          Array.isArray(prefixes) && prefixes.length > 0
            ? prefixes
                .map(
                  (x, i) =>
                    `${i + 1}. **${x.prefix}** (${
                      x.uses
                    } uses) added ${require("moment")
                      .utc(x.added)
                      .fromNow()}\nby -> <@${x.adder}>`
                )
                .join("\n")
            : client.defaultPrefix
      }
    });
  }
};