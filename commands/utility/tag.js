module.exports = {
  name: "tag",
  description: "View, list, create, update, or delete a server tag",
  slash: false,
  owner: false,
  category: "utility",
  aliases: ["t"],
  args: [
    {
      question: "What tag are you trying to use?",
      type: "string",
      key: "name",
    },
  ],
  subcommands: [
    {
      name: "create",
      permissions: ["MANAGE_MESSAGES"],
      description: "Create a tag",
      aliases: ["add"],
      args: [
        {
          question: "What do you want the name of the tag to be?",
          type: "string",
          key: "name",
        },
        {
          question: "What do you want the content of the tag to be?",
          type: "string",
          key: "content",
          joined: true,
        },
      ],
      run: async ({ name, content, client, message, editedMessage }) => {
        let tag = await client.tags.findTag(client, name, message.guild.id);
        if (tag)
          return await message.create(
            `${client.messageEmojis.bad} Tag already exists`,
            { reply: message.id, editedMessage }
          );
        if (
          [
            ...new Set(
              client
                .resolveCommand("tag")
                .subcommands.map((x) =>
                  [
                    x.name,
                    client
                      .resolveCommand("tag")
                      .subcommands.map((y) => y.aliases)
                      .filter((z) => z)
                      .flat(),
                    "cancel",
                  ].flat()
                )
                .flat()
            ),
          ].includes(name.toLowerCase())
        )
          return await message.create(
            `${client.messageEmojis.bad} Reserved tag name entered`,
            { reply: message.id, editedMessage }
          );
        await client.tags.createTag(client, name, content, message);
        return await message.create(
          `${client.messageEmojis.good} Tag created`,
          { reply: message.id, editedMessage }
        );
      },
    },
    {
      name: "list",
      description: "List all tags",
      aliases: ["view"],
      run: async ({ client, message }) => {
        let tags = await client.tags.getTags(message);
        if (!tags.length)
          return await message.create("This guild has no tags", {
            reply: message.id,
            editedMessage,
          });
        tags = Array.from(
          {
            length: Math.ceil(tags.length / 10),
          },
          (a, r) => tags.slice(r * 10, r * 10 + 10)
        );
        tags = tags.map((data) => ({
          color: Number("0x" + client.color.slice(1)),
          author: {
            name: "Tags",
            url: client.user.avatarURL({ format: "png" }),
            iconURL: client.user.avatarURL({ format: "png" }),
          },
          description: `${data.map((da) => `\`${da.name}\``).join(" | ")}`,
        }));
        await client.pagination(message, {
          embeds: tags,
          dropdown: tags.slice(0, 25),
          page: true,
          editedMessage,
        });
      },
    },
    {
      name: "delete",
      description: "Deletes a tag",
      aliases: ["remove"],
      args: [
        {
          question: "What tag are you delete?",
          type: "string",
          key: "name",
        },
      ],
      run: async ({ name, client, message, editedMessage }) => {
        let tag = await client.tags.findTag(client, name, message.guild.id);
        if (!tag)
          return await message.create(
            `${client.messageEmojis.bad} Tag not found`,
            { reply: message.id, editedMessage }
          );
        if (
          tag.owner !== message.author.id &&
          !client.owners.includes(message.author.id)
        )
          return await message.create(
            `${client.messageEmojis.bad} You do not own this tag`,
            { reply: message.id, editedMessage }
          );
        await message.create("Are you sure you want to delete this tag?", {
          reply: message.id,
          editedMessage,
          buttons: [
            {
              style: "success",
              label: "Yes",
              id: "yes",
              check: (u) => u.id == message.author.id,
              fail: () => {
                return;
              },
              callback: async (interaction) => {
                await client.tags.deleteTag(client, tag, message);
                await interaction.delete();
                return await interaction.respond(
                  `${client.messageEmojis.good} Tag deleted`
                );
              },
            },
            {
              style: "danger",
              label: "No",
              id: "no",
              check: (u) => u.id == message.author.id,
              fail: () => {
                return;
              },
              callback: async (interaction) => {
                return await interaction.delete();
              },
            },
          ],
        });
      },
    },
    {
      name: "edit",
      permissions: ["MANAGE_MESSAGES"],
      description: "Edit a tag",
      aliases: ["update"],
      args: [
        {
          question: "What tag are you editing?",
          type: "string",
          key: "name",
        },
        {
          question: "What do you want the new content to be",
          type: "string",
          key: "content",
          joined: true,
        },
      ],
      run: async ({ name, content, client, message, editedMessage }) => {
        let tag = await client.tags.findTag(client, name, message.guild.id);
        if (!tag)
          return await message.create(
            `${client.messageEmojis.bad} Tag not found`,
            {
              reply: message.id,
              editedMessage,
            }
          );
        if (tag.owner !== message.author.id)
          return await message.create(
            `${client.messageEmojis.bad} You do not own this tag`,
            { reply: message.id, editedMessage }
          );
        await client.tags.editTag(client, name, content, tag, message);
        return await message.create(
          `${client.messageEmojis.good} Tag updated`,
          {
            reply: message.id,
            editedMessage,
          }
        );
      },
    },
    {
      name: "alias",
      permissions: ["MANAGE_MESSAGES"],
      description: "Adds an alias to the tag",
      args: [
        {
          question: "What tag are you editing?",
          type: "string",
          key: "name",
        },
        {
          question: "What alias do you want to add?",
          type: "string",
          key: "alias",
        },
      ],
      run: async ({ name, alias, client, message, editedMessage }) => {
        let tag = await client.tags.findTag(client, name, message.guild.id);
        if (!tag)
          return await message.create(
            `${client.messageEmojis.bad} Tag not found`,
            {
              reply: message.id,
              editedMessage,
            }
          );
        if (tag.owner !== message.author.id)
          return await message.create(
            `${client.messageEmojis.bad} You do not own this tag`,
            { reply: message.id, editedMessage }
          );
        await client.tags.addAlias(client, name, alias, tag, message);
        return await message.create(
          `${client.messageEmojis.good} Alias added`,
          {
            reply: message.id,
            editedMessage,
          }
        );
      },
    },
    {
      name: "meta",
      description: "Gets information on a tag",
      aliases: ["info"],
      args: [
        {
          question: "What tag would you like to get information on ?",
          type: "string",
          key: "name",
        },
      ],
      run: async ({ name, client, message, editedMessage }) => {
        let tag = await client.tags.findTag(client, name, message.guild.id);
        if (!tag)
          return await message.create(
            `${client.messageEmojis.bad} Tag not found`,
            {
              reply: message.id,
              editedMessage,
            }
          );
        tag.owner = message.guild.members.cache.get(tag.owner).user.tag;
        tag.date = require("moment").utc(tag.date).fromNow();
        return await message.create(
          `${Object.entries(tag)
            .map(
              ([K, V]) =>
                `${K.toLowerCase().replace(/\b\w/gim, (v) =>
                  v.toUpperCase()
                )}: ${
                  Array.isArray(V)
                    ? V.map((x) => `\`${x}\``).join(" | ") || "None"
                    : V
                }`
            )
            .join("\n")}`,
          { reply: message.id, editedMessage }
        );
      },
    },
    {
      name: "rename",
      permissions: ["MANAGE_MESSAGES"],
      description: "Renames a tag",
      args: [
        {
          question: "What tag are you renaming?",
          type: "string",
          key: "name",
        },
        {
          question: "What do you want the new name to be?",
          type: "string",
          key: "newName",
        },
      ],
      run: async ({ name, newName, client, message, editedMessage }) => {
        let tag = await client.tags.findTag(client, name, message.guild.id);
        if (!tag)
          return await message.create(
            `${client.messageEmojis.bad} Tag not found`,
            {
              reply: message.id,
              editedMessage,
            }
          );
        if (tag.owner !== message.author.id)
          return await message.create(
            `${client.messageEmojis.bad} You do not own this tag`,
            { reply: message.id, editedMessage }
          );
        if (
          [
            ...new Set(
              client
                .resolveCommand("tag")
                .subcommands.map((x) =>
                  [
                    x.name,
                    client
                      .resolveCommand("tag")
                      .subcommands.map((y) => y.aliases)
                      .filter((z) => z)
                      .flat(),
                    "cancel",
                  ].flat()
                )
                .flat()
            ),
          ].includes(newName.toLowerCase())
        )
          return await message.create(
            `${client.messageEmojis.bad} Reserved tag name entered`,
            { reply: message.id, editedMessage }
          );
        await client.tags.renameTag(client, name, newName, tag, message);
        return await message.create(
          `${client.messageEmojis.good} Tag renamed`,
          {
            reply: message.id,
            editedMessage,
          }
        );
      },
    },
  ],
  run: async ({ name, client, message, editedMessage }) => {
    let tag = await client.tags.findTag(client, name, message.guild.id);
    if (!tag)
      return await message.create(`${client.messageEmojis.bad} Tag not found`, {
        reply: message.id,
        editedMessage,
      });
    return await message.create(tag.content, {
      reply: message.id,
      editedMessage,
    });
  },
};
