module.exports = async function (message, options = {}) {
  let page = 0;
  let getDropdown = () =>
    options.dropdown.map((x, i) => ({
      label: `${options.page ? `Page ${i + 1}` : `${x}`}`,
      value: `${i}`,
      default: i === page,
    }));
  let things = {
    buttons: [
      {
        style: "danger",
        id: "delete",
        emoji: "<:cutie_trash:848216792845516861>",
        check: (m) => m.id === message.author.id,
        fail: () => {
          return;
        },
        callback: async (interaction) => {
          interaction.delete();
        },
      },
    ],
  };
  options.embeds.length > 1
    ? ((things.dropdown = {
        id: "avatarDropdown",
        placeholder: "Choose a page",
        options: getDropdown(),
        check: (u) => u.id === message.author.id,
        fail: () => {
          return;
        },
        callback: async (interaction) => {
          page = parseInt(interaction.args[0]);
          interaction.edit("\u200b", {
            embed: options.embeds[page],
            dropdown: {
              options: getDropdown(),
              components: interaction.message.components,
            },
          });
        },
      }),
      (things.buttons = [
        ...things.buttons,
        {
          style: "primary",
          id: "backward",
          emoji: "<:cutie_backward:848237448269135924>",
          check: (m) => m.id === message.author.id,
          fail: () => {
            return;
          },
          callback: async (interaction) => {
            if (!page) page = options.embeds.length - 1;
            else page--;
            interaction.edit("\u200b", {
              embed: options.embeds[page],
              dropdown: {
                options: getDropdown(),
                components: interaction.message.components,
              },
            });
          },
        },
        {
          style: "primary",
          id: "stop",
          emoji: "<:cutie_stop:848633645123371038>",
          check: (m) => m.id === message.author.id,
          fail: () => {
            return;
          },
          callback: async (interaction) => {
            interaction.edit("\u200b", {
              embed: options.embeds[page],
              components: interaction.message.components.map((c) => ({
                type: c.type,
                components: c.components.map((m) => ({
                  ...m,
                  disabled: true,
                })),
              })),
            });
          },
        },
        {
          style: "primary",
          id: "forward",
          emoji: "<:cutie_forward:848237230363246612>",
          check: (m) => m.id === message.author.id,
          fail: () => {
            return;
          },
          callback: async (interaction) => {
            if (page === options.embeds.length - 1) page = 0;
            else page++;
            interaction.edit("\u200b", {
              embed: options.embeds[page],
              dropdown: {
                options: getDropdown(),
                components: interaction.message.components,
              },
            });
          },
        },
      ]))
    : undefined;

  return await message.create("\u200b", {
    embed: options.embeds[page],
    ...things,
    editedMessage: options.editedMessage
  });
};
