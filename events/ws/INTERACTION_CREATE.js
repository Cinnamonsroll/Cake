const Discord = require("discord.js");
module.exports = async (client, interaction) => {
  function respond(content, options = {}) {
    client.api.interactions(interaction.id, interaction.token).callback.post({
      data: {
        type: 4,
        data: {
          flags: options.emp ? 64 : 0,
          content: content || "",
          embeds: options.embed ? [options.embed] : [],
          components: options.components || []
        }
      }
    });
  }
  function deleteFunction() {
    client.api
      .channels(interaction.channel_id)
      .messages(interaction.message.id)
      .delete();
  }
  function edit(content, options = {}) {
    let data = {
      content: content,
      embeds: options.embed ? [options.embed] : []
    };
    if (options.components) data.components = options.components;
    if (options.dropdown) {
      let components = options.dropdown.components;
      components
        .find(row => row.components.find(item => item.type === 3))
        .components.find(item => item.type == 3).options =
        options.dropdown.options;
      data.components = components;
    }
    client.api
      .channels(interaction.channel_id)
      .messages(interaction.message.id)
      .patch({
        data
      });
    client.api
      .interactions(interaction.id)
      [interaction.token].callback.post({ data: { type: 6 } });
  }
  if (interaction.type === 3) {
    if (interaction.data.values) {
      const bucket = `${interaction.message.channel_id}:${interaction.data.custom_id}`;
      let custom_interaction = {
        ...interaction,
        respond,
        args: interaction.data.values,
        edit,
        delete: deleteFunction
      };
      if (client.cache.dropdowns && client.cache.dropdowns[bucket])
        await client.cache.dropdowns[bucket]._onTimeout(custom_interaction);
      return;
    } else {
      const bucket = `${interaction.message.channel_id}:${interaction.data.custom_id}`;
      let custom_interaction = {
        ...interaction,
        respond,
        edit,
        delete: deleteFunction
      };
      if (client.cache.buttons && client.cache.buttons[bucket])
        await client.cache.buttons[bucket]._onTimeout(custom_interaction);
      return;
    }
  }
  let slashCommand = client.resolveCommand(interaction.data.name.toLowerCase());
  let args = interaction.data.options;
  let data = {
    client,
    respond,
    args,
    edit,
    prefix: await client.getPrefixes(interaction.guild_id),
    user: interaction.member
  };
  if (args) {
    for (let i = 0; i < args.length; i++) {
      let arg = args[i];
      data[arg.name] = arg.value;
    }
  }
  slashCommand.slashRun(data);
};
