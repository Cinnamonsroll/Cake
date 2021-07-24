let { MessageAttachment, MessageEmbed } = require("discord.js");
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
      joined: true,
    },
  ],
  run: async ({ message, editedMessage, client, color }) => {
    let names = require("../../colors");
    let colourChecks = {
        hex: /[#]?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/,
        rgb: /([0-9]{1,3})[, ]{1,2}([0-9]{1,3})[, ]{1,2}([0-9]{1,3})/,
        checkName: (colorName) =>
          names.names.find((name) =>
            name[1].toLowerCase().startsWith(colorName.toLowerCase())
          ),
      },
      Canvas = require("canvas"),
      canvas = Canvas.createCanvas(400, 200),
      context = canvas.getContext("2d");
    if (colourChecks.hex.test(color) && !colourChecks.rgb.test(color))
      color = hexToRGB(color);
    else if (colourChecks.rgb.test(color)) {
      const match = colourChecks.rgb.exec(color);

      color = {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
      };
    } else if (colourChecks.checkName(color))
      color = hexToRGB(colourChecks.checkName(color)[0]);
    else color = undefined;
    if (!color)
      return message.create(`${client.messageEmojis.bad} Invalid color`, {
        reply: message.id,
        editedMessage,
      });

    let colorPackage = require("color")(color),
      lightColors = [],
      darkColors = [],
      correctHex = colorPackage.hex().replace(/#/gi, "");
    for (let i = 0; i < 5; i++)
      lightColors.push(colorPackage.lighten(parseFloat(`0.${i + 1}`)).hex());

    for (let i = 0; i < 5; i++)
      darkColors.push(colorPackage.darken(parseFloat(`0.${i + 1}`)).hex());
    let xLight = 0,
      xDark = 0,
      colors = { light: lightColors, dark: darkColors };
    for (let lightColor of colors.light) {
      context.fillStyle = lightColor;
      context.fillRect(xLight, 0, 100, 100);
      context.fillStyle = require("color")(lightColor).isDark()
        ? "#ffffff"
        : "#000000";
      context.font = "15px Sans";
      context.fillText(lightColor.toUpperCase(), xLight + 15, 20);
      xLight += 100;
    }
    for (let darkColor of colors.dark) {
      context.fillStyle = darkColor;
      context.fillRect(xDark, 100, 100, 100);
      context.fillStyle = require("color")(darkColor).isDark()
        ? "#ffffff"
        : "#000000";
      context.font = "15px Sans";
      context.fillText(darkColor.toUpperCase(), xDark + 15, 120);
      xDark += 100;
    }
    let embed = new MessageEmbed({
      thumbnail: {
        url: `https://singlecolorimage.com/get/${correctHex}/400x400`,
      },
      title: names.name(colorPackage.hex())[1],
      color: Number("0x" + client.color.slice(1)),
      fields: [
        {
          name: "Decimal",
          value: `${parseInt(colorPackage.hex().replace(/#/gi, ""), 16)}`,
        },
        {
          name: "Hexadecimal",
          value: `[${colorPackage.hex()}](https://www.color-hex.com/color/${correctHex}) (${`0x${correctHex}`})`,
        },
        {
          name: "RGB",
          value: `${colorPackage.rgb().array()[0]}, ${
            colorPackage.rgb().array()[1]
          }, ${colorPackage.rgb().array()[2]}`,
        },
        { name: "HSL", value: `${colorPackage.hsl().string()}` },
      ],
    }).setImage(`attachment://thing.png`);

    function hexToRGB(hex) {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null;
    }

    return await message.channel.send({
      embeds: [embed.toJSON()],
      files: [new MessageAttachment(canvas.toBuffer(), "thing.png")],
    });
  },
};
