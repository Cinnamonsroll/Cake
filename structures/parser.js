const Discord = require("discord.js");
module.exports = {
  parseButtons(buttons) {
    let returnButtons = [],
      styles = { success: 3, danger: 4, primary: 1, secondary: 2 };
    for (let button of buttons) {
      let buttonObject = {
        type: 2,
        style: styles[button.style],
        label: button.label || "\u200b",
        custom_id: button.id,
        disabled: !!button.clickable,
        callback: button.callback,
        check: button.check,
        fail: button.fail,
      };
      if (button.emoji) {
        let { id: emojiId, name: emojiName } = Discord.Util.parseEmoji(
          button.emoji
        );
        buttonObject.emoji = { id: emojiId, name: emojiName };
      }
      returnButtons.push(buttonObject);
    }
    return returnButtons;
  },
  parseDropdown(dropdown) {
    let options = [];
    for (let option of dropdown.options || []) {
      if (option.emoji) {
        let { id: emojiId, name: emojiName } = Discord.Util.parseEmoji(
          option.emoji
        );
        option.emoji = { id: emojiId, name: emojiName };
      }
      options.push(option);
    }
    return dropdown.id
      ? [
          {
            type: 3,
            custom_id: dropdown.id,
            disabled: !!dropdown.useable,
            callback: dropdown.callback,
            min_value: dropdown.min_value ?? 0,
            max_value: dropdown.max_value ?? 1,
            check: dropdown.check,
            fail: dropdown.fail,
            placeholder: dropdown.placeholder,
            options,
          },
        ]
      : [];
  },
};
