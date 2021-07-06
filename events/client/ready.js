module.exports = async (client) => {
    let slashCommands = client.commands.filter(x => x.slash)
    let commands = await client.request("GET", "/applications/859948184339087370/commands").then(res => res.json())
    commands.map(command => client.request("DELETE", `/applications/859948184339087370/commands/${command.id}`))
    for (const slash of slashCommands) {
        await client.request('POST', `/applications/859948184339087370/${slash.guild ? `guilds/${slash.guild}/commands` : 'commands'}`, {
            name: slash.name,
            description: slash.description,
            options: slash.options || [],
            default_permissions: true
        });
    }
    console.log("Bot started");
};