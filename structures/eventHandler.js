const { readdirSync } = require("fs");
class EventHandler {
  load(mainPath, subPaths, client) {
    const load = (dirs) => {
      const events = readdirSync(`./${mainPath}/${dirs}/`).filter((x) =>
        x.endsWith(".js")
      );
      for (let file of events) {
        if (dirs === "ws") {
          let evt = require(`../${mainPath}/${dirs}/${file}`);
          let eName = file.split(".")[0];
          client.ws.on(eName, evt.bind(null, client));
          console.log(`[Websocket event] ${eName} loaded!`);
        } else {
          let evt = require(`../${mainPath}/${dirs}/${file}`);
          let eName = file.split(".")[0];
          client.on(eName, evt.bind(null, client));
          console.log(`[Event] ${eName} loaded!`);
        }
      }
    };
    subPaths.map((x) => load(x));
  }
}
module.exports = EventHandler;
