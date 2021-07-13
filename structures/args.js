module.exports = async function argSystem(
    client,
    context,
    args,
    commandargs,
    message
  ) {
    let validateType = async (currentArg, type) => {
      if (!/^(command|string|user)/gim.test(type))
        throw new TypeError("Invalid type");
      switch(type.toLowerCase()){
        case "string":
          return currentArg
        case "command":
          return client.resolveCommand(currentArg)
        case "user":
          return await client.getUser(message, currentArg, true);
      }
    };
    let question = async (time, question) => {
      message.create(question, {
        reply: message.id
      });
      let filter = response => response.author.id === message.author.id;
      let awaitQuestion = await message.channel.awaitMessages({
        filter,
        max: 1,
        time,
        errors: ["time"]
      });
      let content =
        awaitQuestion && awaitQuestion.first()
          ? awaitQuestion.first().content
          : undefined;
      if (content.toLowerCase() === "cancel" || !content) return "cancelled";
      return content;
    };
    if (commandargs.length) {
      let i = 0;
      for (let arg of commandargs) {
        if (!args[i] && !arg.default) {
          let argData = await question((arg.time || 30000), arg.question);
          if (argData === "cancelled")
            return await message.create("Command cancelled", {
              reply: message.id
            });
          context[arg.key] = await validateType(argData, arg.type);
        } else if (!args[i] && arg.default) {
          context[arg.key] = arg.default(message);
        } else {
          context[arg.key] = await validateType(arg.joined ? args.slice(i).join(" ") : args[i], arg.type);
        }
        i++;
      }
    }
    return context;
  };