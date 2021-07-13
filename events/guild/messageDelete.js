module.exports = async (client, message) => {
    let deleteMessageCache = client.cakeCache.messageMap[message.id];
    if(deleteMessageCache) deleteMessageCache.delete()
}