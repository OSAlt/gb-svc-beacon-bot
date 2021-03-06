// Import required files
const DatabaseController = require("../../controllers/DatabaseController");

module.exports = {
    name: 'unmute',
    description: `Enables a user's ability to once again send messages or talk in voice chats`,
    aliases: ['unsilence'],
    usage: "<@user | user id>",
    cooldown: 5,
    enabled: true,
    mod: true,
    super: false,
    admin: false,
    execute(message, args, client) {
        const prefix = client.settings.get("prefix");
        if (!args.length) {
            // If no arguments let users know arguments are required
            return message.reply(`You must mention the user or add the user's id that you wish to unmute and add a reason!\n\nExamples: \`${prefix}mute @username, link spamming\` \`${prefix}mute 1234567890, mass spam\``);
        } else {
            // Call the query handler from the database controller with required args
            DatabaseController.queryHandler(message, args, client);
        }
    },
};
