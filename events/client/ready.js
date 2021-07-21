let request = (module.exports = async (client) => {
  let slashCommands = client.commands.filter((x) => x.slash);
  let commands = await client.request.get(
    "https://discord.com/api/v9/applications/859948184339087370/commands"
  ).then(x => x.json())
  commands.map((command) =>
    client.request.delete(
      `https://discord.com/api/v9/applications/859948184339087370/commands/${command.id}`
    )
  );
  for (const slash of slashCommands) {
    await client.request.post(
      `https://discord.com/api/v9/applications/859948184339087370/${
        slash.guild ? `guilds/${slash.guild}/commands` : "commands"
      }`,
      {
        body: {
          name: slash.name,
          description: slash.description,
          options: slash.options || [],
          default_permissions: true,
        },
      }
    );
  }
  console.log("Bot started");
});
