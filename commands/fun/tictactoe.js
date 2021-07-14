module.exports = {
  name: "tictactoe",
  description: "Play a game of tictactoe against another user",
  slash: false,
  owner: false,
  category: "fun",
  aliases: ["ttt"],
  args: [
    {
      question: "Who would you like to play against?",
      type: "user",
      key: "user",
    },
  ],
  run: async ({ message, user, editedMessage }) => {
    if (!user || user.id === message.member.id || user.bot)
      return await message.create("Please include a valid user", {editedMessage});
    let board = [0, 0, 0, 0, 0, 0, 0, 0, 0],
      players = [
        {
          member: message.member,
          id: message.member.id,
          symbol: "❌",
          colour: 3,
        },
      ],
      player = 0;
    await message.create(
      `${message.member} would like to play a game of tictactoe against you, do you accept?`,
      {
        editedMessage,
        buttons: [
          {
            label: "Accept",
            id: "accept",
            style: "success",
            check: (u) => u.id === user.id,
            fail: (interaction) =>
              interaction.respond("You cannot accept this game", { emp: true }),
            callback: async (interaction) => {
              players.push({
                member: user,
                id: user.id,
                symbol: "⭕",
                colour: 4,
              });
              interaction.delete();
              await startGame();
            },
          },
          {
            label: "Decline",
            id: "decline",
            style: "danger",
            check: (u) => u.id === user.id,
            fail: (interaction) =>
              interaction.respond("You cannot decline this game", {
                emp: true,
              }),
            callback: async (interaction) => {
              interaction.respond(`${user} declined the game of tictactoe`);
              return interaction.delete();
            },
          },
        ],
      }
    );
    function win() {
      const allPossibleWins = [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
          [1, 4, 7],
          [2, 5, 8],
          [3, 6, 9],
          [1, 5, 9],
          [3, 5, 7],
        ],
        XwinCheck = !!allPossibleWins
          .map(
            (win) =>
              win.map((index) => board[index - 1]).filter((e) => e === "❌")
                .length === 3
          )
          .filter((element) => element).length,
        OwinCheck = !!allPossibleWins
          .map(
            (win) =>
              win.map((index) => board[index - 1]).filter((e) => e === "⭕")
                .length === 3
          )
          .filter((element) => element).length;

      return XwinCheck ? "X" : OwinCheck ? "O" : "";
    }
    async function handleButton(interaction) {
      let number = parseInt(interaction.data.custom_id);
      board[number - 1] = players[player].symbol;
      let index = Number(
        Array.from({ length: 3 }, (_, i) => {
          let correctIndex;
          if (
            interaction.message.components[i].components.find(
              (x) => x.custom_id === String(number)
            )
          )
            correctIndex = i;
          return correctIndex;
        })
          .filter((x) => x)
          .join("")
      );
      interaction.message.components[index].components = [
        ...interaction.message.components[index].components.map((x) =>
          x.custom_id === String(number)
            ? {
                type: 2,
                style: players[player].colour,
                custom_id: String(number),
                emoji: { name: players[player].symbol, id: null },
                disabled: true,
              }
            : x
        ),
      ];
      if (win()) {
        interaction.edit(`${players[player].member} won!`, {
          components: interaction.message.components.map((c) => ({
            type: c.type,
            components: c.components.map((m) => ({
              ...m,
              disabled: true,
            })),
          })),
        });
      } else if (board.filter((x) => x).length === 9) {
        interaction.edit(`It was a tie`, {
          components: interaction.message.components.map((c) => ({
            type: c.type,
            components: c.components.map((m, i) => ({
              ...m,
              disabled: true,
            })),
          })),
        });
      } else {
        player = (player + 1) % players.length;
        interaction.edit(`It is ${players[player].member}\'s turn`, {
          components: interaction.message.components,
        });
      }
    }
    async function startGame() {
      let buttons = Array.from({ length: 9 }).map((x, i) => ({
        style: "secondary",
        label: "",
        id: i + 1,
        check: (u) => u.id === players[player].id,
        fail: (interaction) =>
          interaction.respond("It is not your turn", { emp: true }),
        callback: async (interaction) => {
          handleButton(interaction);
        },
      }));
      await message.create(`It is ${players[player].member}\'s turn`, {
        editedMessage,
        buttons: [
          ...buttons,
          {
            label: "Forfeit",
            style: "primary",
            id: "d",
            check: (u) => u.id === players[player].id,
            fail: (interaction) =>
              interaction.respond("It is not your turn", { emp: true }),
            callback: async (interaction) => {
              interaction.edit(
                `${players[(player + 1) % players.length].member} won!`,
                {
                  components: interaction.message.components.map((c) => ({
                    type: c.type,
                    components: c.components.map((m) => ({
                      ...m,
                      disabled: true,
                    })),
                  })),
                }
              );
            },
          },
        ],
        limit: 3,
      });
    }
  },
};
