module.exports = {
  name: "reload",
  description: "Reload's commands",
  slash: false,
  owner: true,
  category: "owner",
  aliases: ["r", "getzefuckoutofhere"],
  args: [
    {
      question: "What do you want to reload?",
      type: "string",
      key: "command",
      joined: true,
      time: 60000,
    },
  ],
  run: async ({ client, message, command, editedMessage }) => {
    let parsedData = [],
      status = [];
    for (let parsing of command.split(" ")) {
      let category = client
        .getCategories(message)
        .includes(parsing.toLowerCase());
      let command = client.resolveCommand(parsing.toLowerCase());
      let subcommand = client.commands.find((x) =>
        x.subcommands?.find(
          (y) =>
            y.name === parsing.toLowerCase() ||
            (y.aliases && y.aliases.includes(parsing.toLowerCase()))
        )
      );
      if (category)
        parsedData.push(
          client.commands.filter((x) => x.category === parsing.toLowerCase())
        );
      else if (command) parsedData.push(command);
      else if (subcommand) parsedData.push({...subcommand, subname: parsing.toLowerCase()});
    }
    parsedData = parsedData.flat();
    for (let parsedCommand of parsedData) {
      try {
        client.commands = client.commands.filter(
          (x) => x.name !== parsedCommand.name
        );
        delete require.cache[
          require.resolve(
            `../${parsedCommand.category}/${parsedCommand.name}.js`
          )
        ];
        client.commands.push(
          require(`../${parsedCommand.category}/${parsedCommand.name}.js`)
        );
        status.push({
          command: `${parsedCommand.name} ${parsedCommand.subname ? `(${parsedCommand.subname})` : ""}`,
          status: client.messageEmojis.good,
        });
      } catch (err) {
        status.push({
          command: `${parsedCommand.name} ${parsedCommand.subname ? `(${parsedCommand.subname})` : ""}`,
          status: `${client.messageEmojis.bad} ${err.message.replace(
            /(require(\s+)stack(:)([\s\S]*))?/gim,
            ""
          )}`,
        });
      }
    }
    status = status.map((x, i) => `${++i}. ${x.command} (${x.status})`);
    status = Array.from(
      {
        length: Math.ceil(status.length / 10),
      },
      (a, r) => status.slice(r * 10, r * 10 + 10)
    );
    status = status.map((x) => ({
      author: {
        name: client.user.tag,
        url: `https://discord.com/users/${client.user.id}`,
        icon_url: client.user.displayAvatarURL(),
      },
      color: Number("0x" + client.color.slice(1)),
      description: `${x.map((y) => y).join("\n")}`,
    }));
    await client.pagination(message, {
      embeds: status,
      dropdown: status.slice(0, 25),
      editedMessage
    });
  },
};
