module.exports = async (client, oldMessage, newMessage) => {
    if (oldMessage === newMessage || oldMessage.content === newMessage.content) return;
    let editMessageCache = client.cakeCache.messageMap?.[oldMessage.id];
    if(editMessageCache) client.emit("messageCreate", newMessage, editMessageCache)
}