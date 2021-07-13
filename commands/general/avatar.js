module.exports = {
  name: "avatar",
  description: "Gets user avatar",
  slash: false,
  owner: false,
  category: "general",
  aliases: ["av", "pfp"],
  args: [
    {
      question: "Whos avatar would you like to view?",
      type: "user",
      default: (m) => m.member,
      key: "user",
    },
  ],
  run: async ({ message, user, client }) => {
    let avatarURL = (size, format, dynamic) => {
      return user.user.avatarURL({
        size: size === "Direct" ? 1024 : size,
        format,
        dynamic,
      });
    };
    let sizes = ["Direct", 128, 256, 512, 1024, 2048, 4096];
    let types = ["png", "jpg", "webp"];
    user.user.avatarURL({ dynamic: true }).endsWith("gif")
      ? types.push("gif")
      : "";
    let avatarEmbeds = [];
    for (let type of types) {
      let embed = {};
      embed.color = Number("0x" + client.color.slice(1));
      embed.title = `\`${user.user.tag}\'s\` Avatar`;
      embed.description = `\`${type.toUpperCase()}\` ${sizes
        .map(
          (x) => `[${x}](${avatarURL(x, type, type === "gif" ? true : false)})`
        )
        .join(" | ")}`;
      embed.image = {
        url: avatarURL(1024, type, type === "gif" ? true : false),
        proxyUrl: avatarURL(1024, type, type === "gif" ? true : false),
      };
      avatarEmbeds.push(embed);
    }
    await client.pagination(message, {
      embeds: avatarEmbeds,
      dropdown: types,
    });
  },
};
