module.exports = {
    name: "chess",
    description: "Play a game of chess against another user",
    slash: false,
    owner: true,
    category: "fun",
    aliases: ["cheese"],
    args: [
      {
        question: "Who would you like to play against?",
        type: "user",
        key: "user"
      }
    ],
    run: async ({ message, user }) => {
      if (!user || user.id === message.member.id || user.bot)
        return await message.create("Please include a valid user");
      let pieceInfo = {
          black: {
            king: { emoji: "<:chess_king:862138259773063188>", value: 12 },
            queen: { emoji: "<:chess_queen:862138607254503444>", value: 11 },
            bishop: { emoji: "<:chess_bishop:862136835311271977>", value: 5 },
            knight: { emoji: "<:chess_knight:862135468875448320>", value: 4 },
            rook: { emoji: "<:chess_rook:862136894166007808>", value: 3 },
            pawn: { emoji: "<:chess_pawn:862137832201912331>", value: 1 }
          },
          white: {
            king: { emoji: "<:white_chess_king:862144097350320148>", value: 12 },
            queen: {
              emoji: "<:white_chess_queen:862144220239364146> ",
              value: 11
            },
            bishop: {
              emoji: "<:white_chess_bishop:862144419553476620>",
              value: 5
            },
            knight: {
              emoji: "<:white_chess_knight:862144328671821845>",
              value: 4
            },
            rook: { emoji: "<:white_chess_rook:862143883802837002>", value: 3 },
            pawn: { emoji: "<:white_chess_pawn:862143524504993802>", value: 1 }
          }
        },
        generateLastRowPieces = color => {
          return [
            pieceInfo[color].king.emoji,
            pieceInfo[color].queen.emoji,
            pieceInfo[color].bishop.emoji,
            pieceInfo[color].knight.emoji,
            pieceInfo[color].rook.emoji
          ];
        },
        board = [
          ...generateLastRowPieces("black"),
          ...Array.from({ length: 5 }, () => pieceInfo.black.pawn.emoji),
          ...Array(5).fill(0),
          ...Array.from({ length: 5 }, () => pieceInfo.white.pawn.emoji),
          ...generateLastRowPieces("white")
        ],
        players = [
          {
            member: message.member,
            id: message.member.id,
            colour: "white",
            taken: [],
            selected: {}
          }
        ],
        player = 0;
      await message.create(
        `${message.member} would like to play a game of chess against you, do you accept?`,
        {
          buttons: [
            {
              label: "Accept",
              id: "accept",
              style: "success",
              check: u => u.id === user.id,
              fail: interaction =>
                interaction.respond("You cannot accept this game", { emp: true }),
              callback: async interaction => {
                players.push({
                  member: user,
                  id: user.id,
                  colour: "black",
                  taken: [],
                  selected: {}
                });
                interaction.delete();
                await startGame();
              }
            },
            {
              label: "Decline",
              id: "decline",
              style: "danger",
              check: u => u.id === user.id,
              fail: interaction =>
                interaction.respond("You cannot decline this game", {
                  emp: true
                }),
              callback: async interaction => {
                interaction.respond(`${user} declined the game of chess`);
                return interaction.delete();
              }
            }
          ]
        }
      );
      let handleButton = async interaction => {
        let button = interaction.message.components
          .find(x =>
            x.components.find(y => y.custom_id === interaction.data.custom_id)
          )
          .components.find(x => x.custom_id === interaction.data.custom_id);
        if (!button.emoji || !button.emoji.name) {
          if (!players[player].selected.piece)
            return interaction.respond("You have not yet selected a piece", {
              emp: true
            });
          interaction.message.components = interaction.message.components.map(
            x => ({
              type: x.type,
              components: x.components.map((y, i) =>
                y.custom_id === players[player].selected.piece.custom_id
                  ? {
                      type: 2,
                      label: "\u200b",
                      custom_id: y.custom_id,
                      style: i % 2 === 0 ? 1 : 2
                    }
                  : y.custom_id === interaction.data.custom_id
                  ? {
                      type: 2,
                      label: "\u200b",
                      custom_id: y.custom_id,
                      style: i % 2 === 0 ? 2 : 1,
                      emoji: {
                        name: players[player].selected.piece.emoji.name,
                        id: players[player].selected.piece.emoji.id
                      }
                    }
                  : y
              )
            })
          );
          players[player].selected = {};
        }
        if (
          (button.emoji &&
            (button.emoji.name.includes("white") &&
              players[player].colour === "black")) ||
          (button.emoji &&
            (!button.emoji.name.includes("white") &&
              players[player].colour === "white"))
        )
          return interaction.respond("You can't move this piece!", { emp: true });
        if (button.emoji) players[player].selected.piece = button;
        if(button.emoji) interaction.message.components = interaction.message.components.map(
          x => ({
            type: x.type,
            components: x.components.map(y =>
              y.custom_id === button.custom_id ? { ...y, style: 3 } : y
            )
          })
        );
        interaction.edit(
          `It is ${players[player].member}\'s turn'\n**Data**\nSelected: ${
            players[player].selected.piece
              ? `<:${players[player].selected.piece.emoji.name}:${players[player].selected.piece.emoji.id}>`
              : "None"
          }`,
          { components: interaction.message.components }
        );
      };
      async function startGame() {
        await message.create(
          `It is ${
            players[player].member
          }\'s turn'\n**Data**\nSelected: ${players[player].selected.piece ??
            "None"}`,
          {
            buttons: Array.from({ length: 25 }).map((x, i) => ({
              style: i % 2 === 0 ? "secondary" : "primary",
              label: "",
              emoji: board[i] === 0 ? "" : board[i],
              id: i + 1,
              check: u => u.id === players[player].id,
              fail: interaction =>
                interaction.respond("It is not your turn", { emp: true }),
              callback: async interaction => {
                await handleButton(interaction);
              }
            }))
          }
        );
      }
    }
  };
  