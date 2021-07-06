const mongoose = require("mongoose");
const guildschema = new mongoose.Schema({
  guild: { type: String, required: true },
  prefixes: { type: Array, default: []},
  tags: { type: Array, default: [] }
});
module.exports = mongoose.model("Guilds", guildschema);
