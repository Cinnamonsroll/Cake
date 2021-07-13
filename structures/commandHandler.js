const { readdirSync } = require("fs");
class CommandHandler {
  load(mainPath, subPaths, client) {
    const load = (dirs) => {
      const commands = readdirSync(`./${mainPath}/${dirs}/`).filter((x) =>
        x.endsWith(".js")
      );
      for (let file of commands) {
        let pull = require(`../${mainPath}/${dirs}/${file}`);
        client.commands.push(pull);
      }
    };
    subPaths.map((x) => load(x));
  }
}
module.exports = CommandHandler;
