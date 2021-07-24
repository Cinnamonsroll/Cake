module.exports = {
    name: "color",
    description: "Sends information about a color",
    slash: false,
    owner: false,
    category: "general",
    aliases: ["colour"],
    args: [
      {
        question: "What color would you like information on?",
        type: "string",
        key: "color",
        joined: true
      }
    ],
    run: async ({ message, editedMessage, client, color }) => {
      let names = require("../../colors");
      let colourChecks = {
        hex: /[#]?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/,
        rgb: /([0-9]{1,3})[, ]{1,2}([0-9]{1,3})[, ]{1,2}([0-9]{1,3})/,
        checkName: colorName =>
          names.names.find(name =>
            name[1].toLowerCase().startsWith(colorName.toLowerCase())
          )
      };
      if (colourChecks.hex.test(color) && !colourChecks.rgb.test(color))
        color = hexToRGB(color);
      else if (colourChecks.rgb.test(color)) {
        const match = colourChecks.rgb.exec(color);
  
        color = {
          r: parseInt(match[1]),
          g: parseInt(match[2]),
          b: parseInt(match[3])
        };
      } else if (colourChecks.checkName(color))
        color = hexToRGB(colourChecks.checkName(color)[0]);
      else color = undefined;
      if (!color)
        return message.create(`${client.messageEmojis.bad} Invalid color`, {
          reply: message.id,
          editedMessage
        });
  
      let colorPackage = require("color")(color),
        lightColors = [],
        darkColors = [],
        correctHex = colorPackage.hex().replace(/#/gi, "");
      for (let i = 0; i < 5; i++)
        lightColors.push(
          colorPackage
            .lighten(parseFloat(`0.${i + 1}`))
            .hex()
            .replace(/#/gi, "")
        );
  
      for (let i = 0; i < 5; i++)
        darkColors.push(
          colorPackage
            .darken(parseFloat(`0.${i + 1}`))
            .hex()
            .replace(/#/gi, "")
        );
      return await message.create("", {
        embed: {
          title: names.name(colorPackage.hex())[1],
          color: Number("0x" + client.color.slice(1)),
          fields: [
            {
              name: "Decimal",
              value: `${parseInt(colorPackage.hex().replace(/#/gi, ""), 16)}`
            },
            {
              name: "Hexadecimal",
              value: `[${colorPackage.hex()}](https://www.color-hex.com/color/${correctHex}) (${`0x${correctHex}`})`
            },
            {
              name: "RGB",
              value: `${colorPackage.rgb().array()[0]}, ${
                colorPackage.rgb().array()[1]
              }, ${colorPackage.rgb().array()[2]}`
            },
            { name: "HSL", value: `${colorPackage.hsl().string()}` },
            {
              name: "Lighter colours",
              value: `${lightColors
                .map(
                  x =>
                    `[#${x}](https://www.color-hex.com/color/${x}) (${`0x${x}`})`
                )
                .join("\n")}`
            },
            {
              name: "Darker colours",
              value: `${darkColors
                .map(
                  x =>
                    `[#${x}](https://www.color-hex.com/color/${x}) (${`0x${x}`})`
                )
                .join("\n")}`
            }
          ]
        }
      });
      function hexToRGB(hex) {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16)
            }
          : null;
      }
    }
  };
  