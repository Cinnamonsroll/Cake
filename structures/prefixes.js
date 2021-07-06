module.exports = {
    validate(guildData, prefix){
        return guildData.prefixes.find(x => x.prefix === prefix)
    },
    async remove(guildData, client, message, prefix){
        guildData.prefixes = guildData.prefixes.filter(
            x => x.prefix !== prefix
          );
        await guildData.save();
        client.cache.prefix[`prefix.${message.guild.id}`] =
          guildData.prefixes.length > 0
            ? guildData.prefixes
            : client.defulatPrefix;
    },
    async create(guildData, client, message, prefix){
        guildData.prefixes.push({
            prefix,
            uses: 0,
            added: Date.now(),
            adder: message.member.id
          });
          await guildData.save();
          client.cache.prefix[
            `prefix.${message.guild.id}`
          ] = guildData.prefixes
    }
}