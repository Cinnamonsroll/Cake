const Client = new (require("./structures/client.js"))(
  "c~",
  require("./config.json").owners,
  {
    partials: ["MESSAGE", "USER", "REACTION"],
    restTimeOffset: 60,
    intents: 32767,
  }
);
Client.loadCommands(["general", "fun", "utility", "owner", "config"])
  .loadEvents(["client", "guild", "ws"])
  .setupDatabase(Client.config.mongo)
  .run(Client.config.token);