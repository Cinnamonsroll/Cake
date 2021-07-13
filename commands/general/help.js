module.exports = {
  name: "help",
  description: "A very cool help command.",
  slash: true,
  owner: false,
  category: "general",
  aliases: ["h"],
  options: [
    {
      name: "category",
      description: "The category",
      type: 3,
      required: false,
    },
    {
      name: "commandinfo",
      description: "The command to get info on",
      type: 3,
      required: false,
    },
    {
      name: "subcommandinfo",
      description: "The subcommand to get info on",
      type: 3,
      required: false,
    },
  ],
  slashRun: async ({
    client,
    respond,
    category,
    commandinfo,
    subcommandinfo,
    prefix,
    user,
  }) => {
    String.prototype.toProperCase = function () {
      return this.toLowerCase().replace(/\b\w/gi, (w) => w.toUpperCase());
    };
    if (
      category &&
      client.getCategories({ author: { id: user.user.id } }).includes(category)
    ) {
      return await respond("", {
        embed: {
          color: Number("0x" + client.color.slice(1)),
          fields: [
            {
              name: "Category",
              value: `${category.toProperCase()}`,
            },
            {
              name: "Commands",
              value: client.commands
                .filter((x) => x.category === category.toLowerCase())
                .map((x) => "`" + x.name.toProperCase() + "`")
                .join(", "),
            },
          ],
        },
      });
    } else if (
      commandinfo &&
      client.resolveCommand(commandinfo.toLowerCase()) &&
      subcommandinfo &&
      client.resolveSubCommand(
        client,
        commandinfo.toLowerCase(),
        subcommandinfo.toLowerCase()
      )
    ) {
      let command = client.resolveCommand(commandinfo.toLowerCase());
      let subCommand = client.resolveSubCommand(
        client,
        commandinfo.toLowerCase(),
        subcommandinfo.toLowerCase()
      );
      let fields = [];
      subCommand.aliases
        ? fields.push({
            name: "Aliases",
            value: `${subCommand.aliases
              .map((x) => `\`${x.toProperCase()}\``)
              .join(", ")}`,
          })
        : undefined;
      return await respond("", {
        embed: {
          title: `${command.name.toProperCase()} - ${subCommand.name.toProperCase()}`,
          description: subCommand.description,
          color: Number("0x" + client.color.slice(1)),
          fields,
        },
      });
    } else if (
      commandinfo &&
      client.resolveCommand(commandinfo.toLowerCase())
    ) {
      let command = client.resolveCommand(commandinfo.toLowerCase());
      let fields = [
        { name: "Category", value: command.category.toProperCase() },
      ];
      command.aliases
        ? fields.push({
            name: "Aliases",
            value: `${command.aliases
              .map((x) => `\`${x.toProperCase()}\``)
              .join(", ")}`,
          })
        : undefined;
      command.subcommands
        ? fields.push({
            name: "Sub commands",
            value: `${command.subcommands
              .map((x) => `\`${x.name.toProperCase()}\``)
              .join(", ")}`,
          })
        : undefined;
      return await respond("", {
        embed: {
          title: command.name.toProperCase(),
          description: command.description,
          color: Number("0x" + client.color.slice(1)),
          fields,
        },
      });
    } else {
      return await respond("", {
        embed: {
          color: Number("0x" + client.color.slice(1)),
          fields: [
            {
              name: "Getting started",
              value: `Haha prefixes go brrr`,
            },
            {
              name: "Categories",
              value: client
                .getCategories({ author: { id: user.user.id } })
                .map((x) => x.toProperCase())
                .join("\n"),
            },
          ],
        },
      });
    }
  },
  run: async ({ message, client, realPrefix, args }) => {
    String.prototype.toProperCase = function () {
      return this.toLowerCase().replace(/\b\w/gi, (w) => w.toUpperCase());
    };
    if (args[0] && client.getCategories(message).includes(args[0])) {
      return await message.create("", {
        embed: {
          color: Number("0x" + client.color.slice(1)),
          fields: [
            {
              name: "Category",
              value: `${args[0].toProperCase()}`,
            },
            {
              name: "Commands",
              value: client.commands
                .filter((x) => x.category === args[0].toLowerCase())
                .map((x) => "`" + x.name.toProperCase() + "`")
                .join(", "),
            },
          ],
        },
      });
    } else if (
      args[0] &&
      client.resolveCommand(args[0].toLowerCase()) &&
      args[1] &&
      client.resolveSubCommand(
        client,
        args[0].toLowerCase(),
        args[1].toLowerCase()
      )
    ) {
      let command = client.resolveCommand(args[0].toLowerCase());
      let subCommand = client.resolveSubCommand(
        client,
        args[0].toLowerCase(),
        args[1].toLowerCase()
      );
      let fields = [];
      subCommand.aliases
        ? fields.push({
            name: "Aliases",
            value: `${subCommand.aliases
              .map((x) => `\`${x.toProperCase()}\``)
              .join(", ")}`,
          })
        : undefined;
      return await message.create("", {
        embed: {
          title: `${command.name.toProperCase()} - ${subCommand.name.toProperCase()}`,
          description: subCommand.description,
          color: Number("0x" + client.color.slice(1)),
          fields,
        },
      });
    } else if (args[0] && client.resolveCommand(args[0].toLowerCase())) {
      let command = client.resolveCommand(args[0].toLowerCase());
      let fields = [
        { name: "Category", value: command.category.toProperCase() },
      ];
      command.aliases
        ? fields.push({
            name: "Aliases",
            value: `${command.aliases
              .map((x) => `\`${x.toProperCase()}\``)
              .join(", ")}`,
          })
        : undefined;
      command.subcommands
        ? fields.push({
            name: "Sub commands",
            value: `${command.subcommands
              .map((x) => `\`${x.name.toProperCase()}\``)
              .join(", ")}`,
          })
        : undefined;
      return await message.create("", {
        embed: {
          title: command.name.toProperCase(),
          description: command.description,
          color: Number("0x" + client.color.slice(1)),
          fields,
        },
      });
    } else {
      return await message.create("", {
        embed: {
          color: Number("0x" + client.color.slice(1)),
          fields: [
            {
              name: "Getting started",
              value: `Haha prefixes go brrr`,
            },
            {
              name: "Categories",
              value: client
                .getCategories(message)
                .map((x) => x.toProperCase())
                .join("\n"),
            },
          ],
        },
      });
    }
  },
};
