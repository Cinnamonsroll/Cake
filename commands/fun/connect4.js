module.exports = {
  name: "connect4",
  description: "Play a game of connect 4 against another user",
  slash: false,
  owner: false,
  category: "fun",
  aliases: ["c4"],
  args: [
    {
      question: "Who would you like to play against?",
      type: "user",
      key: "user",
    },
  ],
  run: async ({ message, user }) => {
    if (!user || user.id === message.member.id || user.bot)
      return await message.create("Please include a valid user");
    let numbers = {
      array: ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣"],
      get string() {
        return this.array.join("");
      },
    };
    let board = Array.from({ length: 6 }, () =>
        Array.from({ length: 7 }, () => "⬛")
      ),
      disabled = {
        0: false,
        1: false,
        2: false,
        3: false,
        4: false,
        5: false,
        6: false,
      },
      moveHistory = [],
      players = [
        {
          member: message.member,
          id: message.member.id,
          symbol: "🟥",
          win: "<a:blinkingred:861781713968431145>",
        },
      ],
      player = 0;
    await message.create(
      `${message.member} would like to play a game of connect 4 against you, do you accept?`,
      {
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
                symbol: "🟨",
                win: "<a:yellowblink:861782608383311893>",
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
              interaction.respond(`${user} declined the game of connect 4`);
              return interaction.delete();
            },
          },
        ],
      }
    );
    let displayBoard = (board) =>
      `${numbers.string}\n` + board.map((x) => x.join("")).join("\n");
    const checkWin = (a, b, c, d) =>
      a === b && b === c && c === d && a !== "⬛";

    const verticalCheck = () => {
      for (let j = 0; j < 7; j++) {
        for (let i = 0; i < 3; i++) {
          if (
            checkWin(
              board[i][j],
              board[i + 1][j],
              board[i + 2][j],
              board[i + 3][j]
            )
          )
            return {
              win: true,
              spots: [
                { i, j },
                { i: i + 1, j },
                { i: i + 2, j },
                { i: i + 3, j },
              ],
            };
        }
      }
    };
    const horizontalCheck = () => {
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 4; j++) {
          if (
            checkWin(
              board[i][j],
              board[i][j + 1],
              board[i][j + 2],
              board[i][j + 3]
            )
          )
            return {
              win: true,
              spots: [
                { i, j },
                { i, j: j + 1 },
                { i, j: j + 2 },
                { i, j: j + 3 },
              ],
            };
        }
      }
    };
    const diagonalCheck1 = () => {
      for (let col = 0; col < 4; col++) {
        for (let row = 0; row < 3; row++) {
          if (
            checkWin(
              board[row][col],
              board[row + 1][col + 1],
              board[row + 2][col + 2],
              board[row + 3][col + 3]
            )
          )
            return {
              win: true,
              spots: [
                { i: row, j: col },
                { i: row + 1, j: col + 1 },
                { i: row + 2, j: col + 2 },
                { i: row + 3, j: col + 3 },
              ],
            };
        }
      }
    };
    const diagonalCheck2 = () => {
      for (let col = 0; col < 4; col++) {
        for (let row = 5; row > 2; row--) {
          if (
            checkWin(
              board[row][col],
              board[row - 1][col + 1],
              board[row - 2][col + 2],
              board[row - 3][col + 3]
            )
          )
            return {
              win: true,
              spots: [
                { i: row, j: col },
                { i: row - 1, j: col + 1 },
                { i: row - 2, j: col + 2 },
                { i: row - 3, j: col + 3 },
              ],
            };
        }
      }
    };
    const drawCheck = () => {
      let full = [];
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 7; j++) {
          if (board[i][j] !== "⬛") {
            full.push(board[i][j]);
          }
        }
      }
      if (full.length == 42) {
        return true;
      }
    };

    let handleButton = (interaction) => {
      const winChecks = [
          verticalCheck,
          horizontalCheck,
          diagonalCheck1,
          diagonalCheck2,
        ],
        spaces = [];
      let yIndex = parseInt(interaction.data.custom_id);
      for (let i = 5; i > -1; i--) {
        if (board[i][yIndex] === "⬛") spaces.push({ i, j: yIndex });
      }
      if (spaces.length > 0)
        board[spaces[0].i][spaces[0].j] = players[player].symbol;
      else {
        disabled[yIndex] = true;
        return interaction.respond(
          "Choose a different column this one is full",
          { emp: true }
        );
      }
      if (drawCheck()) {
        return interaction.edit(
          `It was a draw\n${"🟦".repeat(7)}\n${board
            .map((x) => x.join(""))
            .join("\n")}`,
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
      }

      for (const func of winChecks) {
        const executed = func();
        if (executed && executed.win) {
          for (const spot of executed.spots) {
            board[spot.i][spot.j] = players[player].win;
          }
          return interaction.edit(
            `${players[player].member} Won!\n${"🟦".repeat(7)}\n${board
              .map((x) => x.join(""))
              .join("\n")}`,
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
        }
      }
      moveHistory.unshift({
        color: players[player].symbol,
        name: players[player].member.user.username,
        number: yIndex,
      });
      player = (player + 1) % players.length;
      interaction.message.components = interaction.message.components.map(
        (c) => ({
          type: c.type,
          components: c.components
            .filter((x) => !disabled[parseInt(x.custom_id)])
            .map((m) => ({
              ...m,
            })),
        })
      );
      interaction.edit(
        `${players[player].member}\'s turn\n**Last two moves**\n${
          moveHistory.length
            ? moveHistory
                .slice(0, 2)
                .map(
                  (x, i) =>
                    `${numbers.array[i]}. ${x.color}${
                      numbers.array[x.number]
                    } ${x.name}`
                )
                .join("\n")
            : "No move history"
        }\n\\_\\_\\_\\_\\_\\__\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\n${displayBoard(
          board
        )}`,
        { components: interaction.message.components }
      );
    };
    async function startGame() {
      await message.create(
        `${players[player].member}\'s turn\n**Last two moves**\n${
          moveHistory.length
            ? moveHistory
                .slice(0, 2)
                .map(
                  (x, i) =>
                    `${numbers.array[i]}. ${x.color}${x.number} ${x.name}`
                )
                .join("\n")
            : "No move history"
        }\n\\_\\_\\_\\_\\_\\__\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\n${displayBoard(
          board
        )}`,
        {
          buttons: Array.from({ length: 7 }, (_, i) => ({
            style: "primary",
            id: `${i}`,
            label: "",
            emoji: numbers.array[i],
            check: (u) => u.id === players[player].id,
            fail: (interaction) =>
              interaction.respond("It is not your turn", { emp: true }),
            callback: async (interaction) => {
              handleButton(interaction);
            },
          })),
          limit: 4,
        }
      );
    }
  },
};
