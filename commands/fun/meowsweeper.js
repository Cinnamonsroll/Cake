module.exports = {
  name: "meowsweeper",
  description: "Minesweeper but better because cats",
  slash: false,
  owner: false,
  category: "fun",
  aliases: ["minesweeper"],
  run: async ({ client, message }) => {
    let flagging = false;
    let numbers = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣"];
    let positionMatch = (a, b) => a.x === b.x && a.y === b.y;
    let randomNumber = (size) => Math.floor(Math.random() * size);
    let generateMines = (boardSize, mines) => {
      let positions = [];
      while (positions.length <= mines) {
        const position = {
          x: randomNumber(boardSize),
          y: randomNumber(boardSize),
        };

        if (!positions.some(positionMatch.bind(null, position))) {
          positions.push(position);
        }
      }
      return positions;
    };
    let minePositions = generateMines(5, 7);
    function nearbyTiles(board, { x, y }) {
      const tiles = [];
      for (let xOffset = -1; xOffset <= 1; xOffset++) {
        for (let yOffset = -1; yOffset <= 1; yOffset++) {
          const tile = board[x + xOffset]?.[y + yOffset];
          if (tile) tiles.push(tile);
        }
      }
      return tiles.filter((x) => x && x.mine);
    }
    let generateBoard = (s) => {
      let board = [];
      for (let x = 0; x < s; x++) {
        const row = [];
        for (let y = 0; y < s; y++) {
          row.push({
            mine: minePositions.some(positionMatch.bind(null, { x, y })),
            flagged: false,
            x,
            y,
          });
        }
        board.push(row);
      }
      return board;
    };
    let board = generateBoard(5);
    board.map((x) =>
      x.map((y) => (y.number = numbers[nearbyTiles(board, y).length]))
    );
    let findTile = (id) => {
      return board
        .find((x) =>
          x.find(
            (y) =>
              y.x === parseInt(id.split("|")[0]) &&
              y.y === parseInt(id.split("|")[1])
          )
        )
        .find(
          (y) =>
            y.x === parseInt(id.split("|")[0]) &&
            y.y === parseInt(id.split("|")[1])
        );
    };
    let generateButtons = () => {
      let buttons = [];
      for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 5; y++) {
          buttons.push({
            style: "secondary",
            label: "",
            emoji: "🐱",
            id: `${x}|${y}`,
            check: (u) => u.id === message.member.id,
            fail: (_) => {
              return;
            },
            callback: async (interaction) => {
              let tile = findTile(interaction.data.custom_id);
              if (flagging && !tile.flagged) {
                tile.flagged = !tile.flagged;
                interaction.message.components =
                  interaction.message.components.map((x) => ({
                    type: 1,
                    components: x.components.map((y) =>
                      y.custom_id === interaction.data.custom_id
                        ? {
                            style: 1,
                            type: 2,
                            emoji: {
                              name: "🚩",
                              id: null,
                            },
                            custom_id: interaction.data.custom_id,
                          }
                        : y
                    ),
                  }));
              } else if (tile.mine) {
                interaction.message.components =
                  interaction.message.components.map((x, i) => ({
                    type: 1,
                    components: x.components.map((y, j) => ({
                      style: findTile(y.custom_id).mine ? 4 : 3,
                      type: 2,
                      emoji: {
                        id: null,
                        name: findTile(y.custom_id).mine
                          ? "💣"
                          : findTile(y.custom_id).number,
                      },
                      custom_id: interaction.data.custom_id,
                      disabled: true,
                    })),
                  }));
              } else {
                interaction.message.components =
                  interaction.message.components.map((x) => ({
                    type: 1,
                    components: x.components.map((y) =>
                      y.custom_id === interaction.data.custom_id
                        ? {
                            style: tile.mine ? 4 : 3,
                            type: 2,
                            emoji: {
                              name: tile.number,
                              id: null,
                            },
                            custom_id: interaction.data.custom_id,
                            disabled: true,
                          }
                        : y
                    ),
                  }));
              }

              interaction.edit(
                `Meowsweeper\nFlagging: ${
                  client.messageEmojis[flagging ? "good" : "bad"]
                }`,
                {
                  components: interaction.message.components,
                }
              );
            },
          });
        }
      }

      return buttons;
    };
    await message.create(
      `Meowsweeper\nFlagging: ${
        client.messageEmojis[flagging ? "good" : "bad"]
      }`,
      {
        buttons: generateButtons(),
        reactions: [
          {
            emoji: "🚩",
            check: (u) => u.id === message.member.id,
            callback: (msg) => {
              flagging = !flagging;
              msg.edit(
                `Meowsweeper\nFlagging: ${
                  client.messageEmojis[flagging ? "good" : "bad"]
                }`,
                { components: msg.components }
              );
            },
          },
        ],
      }
    );
  },
};
