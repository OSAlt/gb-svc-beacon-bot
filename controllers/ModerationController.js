const Discord = require("discord.js");
const moment = require("moment");
const {prefix, admin_role, super_role, mod_role, action_log_channel, super_log_channel} = require('../config');
const Kick = require("../models/Kick");
const Ban = require("../models/Ban");
const Unban = require("../models/Unban");
const Warning = require("../models/Warning");
const shortid = require('shortid');

module.exports = {
    deleteHandler: function(m) {
        const message = m;
        const actionLog = message.guild.channels.find((c => c.name === action_log_channel)); //mod log channel

        // Create the delete embed
        const delEmbed = {
            color: 0xff0000,
            title: `Message Deleted in ${message.channel.name}`,
            author: {
                name: `${message.author.username}#${message.author.discriminator}`,
                icon_url: message.author.displayAvatarURL()
            },
            description: `A message by ${message.author} was deleted in ${message.channel}`,
            fields: [
                {
                    name: "Message",
                    value: message.content || "`{Message was either an Embed or Image}`",
                    inline: false,
                }
            ],
            timestamp: new Date()
        }

        // Send the embed to the action log channel
        actionLog.send({embed: delEmbed});
    },
    editHandler: function(o, n, c) {
        const oldMsg = o, newMsg = n, client = c; // creats vars for parameter values
        const superLog = newMsg.guild.channels.find((c => c.name === super_log_channel)); //super log channel

        // Create author var
        const author = client.users.get(newMsg.author.id);
        
        // Create the edit embed
        const editEmbed = {
            color: 0x00ff00,
            title: `Message was edited in ${newMsg.channel.name}`,
            url: `${newMsg.url}`,
            author: {
                name: `${author.username}#${author.discriminator}`,
                icon_url: author.displayAvatarURL(),
            },
            description: `${newMsg.author} has edited a message in ${newMsg.channel}`,
            fields: [
                {
                    name: `Original Message`,
                    value: ` ${oldMsg.content}`,
                },
                {
                    name: `New Message`,
                    value: ` ${newMsg.content}`,
                },
            ],
            timestamp: new Date()
        }

        // Send the edit embed to the super log channel
        superLog.send({embed: editEmbed});
    },
    kickHandler: function(a, m) {
        const args = a;
        const message = m;
        const actionLog = message.guild.channels.find((c => c.name === action_log_channel)); //mod log channel
        let user; // user var

        // Check if the first arg is a number
        if(isNaN(args[0])) {
            // Attempt to fix the arg for the user by removing the comma if the moderator forgot to add a space after the id and before the comma
            args[0] = args[0].replace(",", "");
        }

        // Make sure the first arg was a user mention or a user id
        if(isNaN(args[0]) && !args[0].startsWith("<@!")) {
            // Let user know they need to provide a user mention or a valid user id
            message.reply(`uh oh! Looks like you gave an invalid user mention or user id. Make sure that you are either mentioning a user or providing a valid user id!`);
        } else {

            // Check if a user mention was given
            if(args[0].startsWith("<@!")) {
                user = message.mentions.members.first(); // get user tag
            // If not, find the user by the provided id
            } else {
                // If invalid id let the user know
                if(message.guild.members.get(args[0]) === undefined) {
                    return message.reply(`uh oh! Looks like I wasn't able to find that user, please check the user id and try again or try using a user mention like so: \`@Username\``);

                // If user found, assign it to the user var
                } else {
                    user = message.guild.members.get(args[0]);
                }
            }

            // If a reason was given then kick the user and log the action to the database
            if(args[1]) {
                let reasonArr = args;
                let reason;
                reasonArr.shift(); //remove the first arg (user mention or id)
                reason = reasonArr.join(" "); //turn the array into a string
                reason = reason.replace(',', ''); // remove the first comma from the string
                reason = reason.trim(); // remove any excess whitespace

                /* 
                * Sync the model to the table
                * Creates a new table if table doesn't exist, otherwise just inserts a new row
                * id, createdAt, and updatedAt are set by default; DO NOT ADD
                !!!!
                    Keep force set to false otherwise it will overwrite the table instead of making a new row!
                !!!!
                */
                Kick.sync({ force: false }).then(() => {
                    // Add the kick record to the database
                    Kick.create({
                        user_id: user.id,
                        reason: reason,
                        moderator_id: message.author.id,
                    })
                    // Let the user know it was added
                    .then(() => {

                        // Create the kicked embed
                        const kickEmbed = {
                            color: 0xFFA500,
                            title: `User Was Kicked!`,
                            author: {
                                name: `${user.user.username}#${user.user.discriminator}`,
                                icon_url: user.user.displayAvatarURL(),
                            },
                            description: `${user} was kicked from the server by ${message.author}`,
                            fields: [
                                {
                                    name: `User Kicked`,
                                    value: `${user}`,
                                    inline: true,
                                },
                                {
                                    name: `Kicked By`,
                                    value: `${message.author}`,
                                    inline: true,
                                },
                                {
                                    name: `Reason`,
                                    value: `${reason}`,
                                    inline: false,
                                }
                            ],
                            timestamp: new Date(),
                        };

                        // Kick the user from the server
                        user.kick().then(() => {
                            // Send the embed to the action log channel
                            actionLog.send({embed: kickEmbed});
                        });
                    });
                });
            } else {
                // Check if a user mention was used
                if(message.mentions.users.first()) {
                    // Let user know a reason is needed
                    message.reply(`uh oh! It seems you forgot to give a reason for kicking, please be sure to provide a reason for this action!\nExample: \`${prefix}kick @${user.user.tag}, reason\``);

                // If no user mention was given then just output the id they provided
                } else {
                    // Let user know a reason is needed
                    message.reply(`uh oh! It seems you forgot to give a reason for kicking, please be sure to provide a reason for this action!\nExample: \`${prefix}kick ${user}, reason\``);
                }
            }
        }
    },
    banHandler: function(a, m, c) {
        const args = a;
        const message = m;
        const client = c;
        const actionLog = message.guild.channels.find((c => c.name === action_log_channel)); //mod log channel
        const timezone = moment.tz(moment.tz.guess()).zoneAbbr(); // server timezone
        let user; // user var

        const argsStr = args.join(" "); //create a string out of the args
        const newArgs = argsStr.split(",").map(i => i.trim()); //create a new args array and trim the whitespace from the items


        // Check if the first arg is a number
        if(isNaN(args[0])) {
            // Attempt to fix the arg for the user by removing the comma if the moderator forgot to add a space after the id and before the comma
            args[0] = args[0].replace(",", "");
        }

        // Make sure the first arg was a user mention or a user id
        if(isNaN(args[0]) && !args[0].startsWith("<@!")) {
            // Let user know they need to provide a user mention or a valid user id
            message.reply(`uh oh! Looks like you gave an invalid user mention or user id. Make sure that you are either mentioning a user or providing a valid user id!`);
        } else {

            // Check if a user mention was given
            if(args[0].startsWith("<@")) {

                // Try to get the user
                try {
                    user = message.mentions.members.first().user; // get user tag
                } catch(e) {
                    // If unable to get the user, let the mod know
                    return message.reply(`uh oh! That user isn't a member of this guild!`);
                }
            // If not, find the user by the provided id
            } else {

                // Try to get the user
                try {
                    user = message.guild.members.get(args[0]).user;
                } catch(e) {
                    // If unable to get the user, let the mod know
                    return message.reply(`uh oh! That user isn't a member of this guild!`);
                }

                // If user is undefined let the moderator know
                if(user === undefined) {
                    return message.reply(`uh oh! Looks like I wasn't able to find that user, please check the user id and try again or try using a user mention like so: \`@Username\``)
                }
            }

            // Check if a reason was given
            if(args[1] && user !== undefined) {
                // If a length wasn't given then let the user know it is required
                if(!args[2]) {
                    return message.reply(`uh oh! It seems you forgot to give a length for ther ban, please be sure to provide a ban length for this action!\nExample: \`${prefix}ban ${user}, reason, length\``);

                // If both a reason and length were given ban the user and log the action in the database
                } else {

                    const reason = newArgs[1]; //assign the ban reason
                    let banLength = newArgs[2]; //assign the ban length
                    const banArr = banLength.split(" "); //create a ban array
                    let banUnit;
                    let banValue;
                    const now = moment();

                    // Check the length of the ban array
                    if(banArr.length > 1) {
                            banValue = banArr[0]; //assign the ban value
                            banUnit = banArr[1]; //assign the ban unit

                            if (banUnit === "s" || banUnit === "sec" || banUnit === "secs" || banUnit === "seconds" || banUnit === "second") {
                                return message.reply(`please give a duration that is at least 1 minute in length!`);
                            }
                    } else {
                        // If a permanent option was provided set the ban value to 999
                        if(banArr[0].toLowerCase() === "p" || banArr[0].toLowerCase().includes("perm")) {
                            banValue = 999;
                            banUnit = "years";
                            banLength = "an indefinite amount of time";
                        } else {
                            return message.reply(`uh oh! It seems like you entered an invalue ban duration! Please use formats such as these for the ban duration: \`6 years\`, \`17 d\`, \`permanent\`, \`3 wks\``);
                        }
                    }
                    let unbanDate = now.add(banValue, banUnit); //create the unban date

                    // Make sure the unban date is after the current time
                    if(moment(unbanDate).isAfter(now)) {
                        // If not after the current time, let the user know how to fix the problem
                        return message.reply("uh oh! Looks like you have an invalid duration! Please try again with a proper unit of time and number duration!");
                    }
                    
                    // Format the unban date
                    unbanDate = unbanDate.format(`YYYY-MM-DD HH:mm:ss`);

                    /* 
                    * Sync the model to the table
                    * Creates a new table if table doesn't exist, otherwise just inserts a new row
                    * id, completed, createdAt, and updatedAt are set by default; DO NOT ADD
                    !!!!
                        Keep force set to false otherwise it will overwrite the table instead of making a new row!
                    !!!!
                    */
                    Ban.sync({ force: false }).then(() => {
                        // Add the ban record to the database
                        Ban.create({
                            user_id: user.id,
                            guild_id: message.guild.id,
                            reason: reason,
                            unban_date: unbanDate,
                            moderator_id: message.author.id,
                        })
                        // Let the user know it was added
                        .then(() => {
                            // Create the banned embed
                            const banEmbed = {
                                color: 0xFF0000,
                                title: `User Was Banned!`,
                                author: {
                                    name: `${user.username}#${user.discriminator}`,
                                    icon_url: user.displayAvatarURL(),
                                },
                                description: `${user} was banned from the server by ${message.author} for ${banLength}!`,
                                fields: [
                                    {
                                        name: `User Banned`,
                                        value: `${user}`,
                                        inline: true,
                                    },
                                    {
                                        name: `Banned By`,
                                        value: `${message.author}`,
                                        inline: true,
                                    },
                                    {
                                        name: `Unban Date`,
                                        value: `${unbanDate} (${timezone})`,
                                        inline: true,
                                    },
                                    {
                                        name: `Reason`,
                                        value: `${reason}`,
                                        inline: false,
                                    }
                                ],
                                timestamp: new Date(),
                            };

                            // Ban the user from the server
                            message.guild.members.ban(user.id).then(() => {
                                // Send the embed to the action log channel
                                actionLog.send({embed: banEmbed});
                            });
                        });
                    });
                }

            // If no reason was given let the user know it is required
            } else {
                // Check if a user mention was used
                if(message.mentions.users.first()) {
                    // Let user know a reason is needed
                    message.reply(`uh oh! It seems you forgot to give a reason for banning, please be sure to provide a reason for this action!\nExample: \`${prefix}ban @${user.tag}, reason, length\``);

                // If no user mention was given then just output the id they provided
                } else {
                    // Let user know a reason is needed
                    message.reply(`uh oh! It seems you forgot to give a reason for banning, please be sure to provide a reason for this action!\nExample: \`${prefix}ban ${user}, reason, length\``);
                }
            }
        }
    },
    unbanHandler: function(a, m, c) {
        const args = a;
        const message = m;
        const client = c;
        const actionLog = message.guild.channels.find((c => c.name === action_log_channel)); //mod log channel
        let user; // user var

        // Check if the first arg is a number
        if(isNaN(args[0])) {
            // Attempt to fix the arg for the user by removing the comma if the moderator forgot to add a space after the id and before the comma
            args[0] = args[0].replace(",", "");
        }

        // Make sure the first arg was a user id
        if(isNaN(args[0])) {
            // Let user know they need to provide a valid user id
            message.reply(`uh oh! Looks like you gave an invalid user id. Make sure that you are providing a valid user id!`);
        } else {
            let userId = args[0];

            // Attempt to fetch the user
            client.users.fetch(userId).then((u) => {
                user = u; //assign user

                // If a reason was given then unban the user and log the action to the database
                if(args[1]) {
                    let reasonArr = args;
                    let reason;
                    reasonArr.shift(); //remove the first arg (user id)
                    reason = reasonArr.join(" "); //turn the array into a string
                    reason = reason.replace(',', ''); // remove the first comma from the string
                    reason = reason.trim(); // remove any excess whitespace

                    // Fetch the ban from the server
                    message.guild.fetchBan(user).then(() => {
                        
                        // Search the db for the ban
                        Ban.findOne({where: {user_id: userId, completed: 0}, raw:true}).then((data) => {

                            // Make sure data was retrieved
                            if(data) {
                                const banDate = moment(data.createdAt).format(`YYYY-MM-DD HH:mm:ss`); //assign ban date
                                const banReason = data.reason; //assign ban reason
                                /* 
                                * Sync the model to the table
                                * Creates a new table if table doesn't exist, otherwise just inserts a new row
                                * id, createdAt, and updatedAt are set by default; DO NOT ADD
                                !!!!
                                    Keep force set to false otherwise it will overwrite the table instead of making a new row!
                                !!!!
                                */
                                Unban.sync({ force: false }).then(() => {

                                    // Add the unban record to the database
                                    Unban.create({
                                        user_id: userId,
                                        reason: reason,
                                        type: "Manual",
                                        moderator_id: message.author.id,
                                    })
                                    // Let the user know it was added
                                    .then(() => {

                                        // Create the unban embed
                                        const unbanEmbed = {
                                            color: 0xFF5500,
                                            title: `User Was Unbanned!`,
                                            author: {
                                                name: `${user.username}#${user.discriminator}`,
                                                icon_url: user.displayAvatarURL(),
                                            },
                                            description: `${user} was unbanned from the server by ${message.author}`,
                                            fields: [
                                                {
                                                    name: `User Unbanned`,
                                                    value: `${user}`,
                                                    inline: true,
                                                },
                                                {
                                                    name: `Unbanned By`,
                                                    value: `${message.author}`,
                                                    inline: true,
                                                },
                                                {
                                                    name: `Unban Reason`,
                                                    value: `${reason}`,
                                                    inline: false,
                                                },
                                                {
                                                    name: `Ban Date`,
                                                    value: `${banDate}`,
                                                    inline: false,
                                                },
                                                {
                                                    name: `Ban Reason`,
                                                    value: `${banReason}`,
                                                    inline: false,
                                                }
                                            ],
                                            timestamp: new Date(),
                                        };
                                        // Unban the user from the server
                                        message.guild.members.unban(userId).then(() => {

                                            // Update the completed field for the ban
                                            Ban.update({completed: 1}, {where: {user_id: userId}});

                                            // Send the embed to the action log channel
                                            actionLog.send({embed: unbanEmbed});
                                        });
                                    });
                                });
                            };
                        }).catch((e) => {
                            // If no data was found in the db
                            message.channel.send(`uh oh, it looks like there is no information on this ban in the database!`)
                        });
                    }).catch((e) => {
                        // If no ban was found for that user
                        return message.reply(`you silly! ${user} isn't banned!`)
                    });
                } else {
                    // Let user know a reason is needed
                    message.reply(`uh oh! It seems you forgot to give a reason for unbanning, please be sure to provide a reason for this action!\nExample: \`${prefix}unban ${userId}, reason\``);
                };
            }).catch((e) => {
                // Let the user know there was no user with the given id
                return message.reply(`uh oh! Looks like there is no user with the id \`${userId}\``);
            });
        }
    },
    warnHandler: function(a, m, c) {
        const args = a, message = m, client = c;
        let warnId = shortid.generate(); //generate a short id for the warning
        const actionLog = message.guild.channels.find((c => c.name === action_log_channel)); //mod log channel
        let reason = args.slice(1).join(" "); //remove the user from the array then join to get the reason
        reason = reason.replace(",", ""); //remove the comma
        reason = reason.trim(); //remove any excess whitespace
        let user; //var for the user

        // Check if the first arg is a number
        if(isNaN(args[0])) {
            // Attempt to fix the arg for the user by removing the comma if the moderator forgot to add a space after the id and before the comma
            args[0] = args[0].replace(",", "");
        }

        // Make sure the first arg was a user mention or a user id
        if(isNaN(args[0]) && !args[0].startsWith("<@!")) {
            // Let user know they need to provide a user mention or a valid user id
            message.reply(`uh oh! Looks like you gave an invalid user mention or user id. Make sure that you are either mentioning a user or providing a valid user id!`);
        
        // Make sure the reason wasn't too long for the db column
        } else if(reason.length > 1024) {
            // If the reason is too long let the mod know
            return message.reply(`uh oh! Looks like your message was too long, try shortening the reason or inserting a pastebin link instead!`);
        } else {

            // Check if a user mention was given
            if(args[0].startsWith("<@")) {
                user = message.mentions.members.first().user; // get user tag
            // If not, find the user by the provided id
            } else {
                // Get the user
                user = message.guild.members.get(args[0]);

                // If user is undefined let the moderator know
                if(user === undefined) {
                    return message.reply(`uh oh! Looks like I wasn't able to find that user, please check the user id and try again or try using a user mention like so: \`@Username\``)
                }
            }

            // Check if a reason was given
            if(args[1] && user !== undefined) {
            // Create a new table if one doesn't exist
            Warning.sync({ force: false }).then(() => { 
                // See if the warning id exists already
                Warning.findOne({where: {warning_id: warnId}, raw:true}).then((warning => {
                    // If the warning id matches the newly generated one, generate a new one
                    if(warning) {
                        warnId = shortid.generate();
                    };
                })).then(() => { 
                    // Create a new warning
                    Warning.create({
                        warning_id: warnId, // add the warning Id
                        user_id: user.id, // add the user's id
                        type: "Note", // assign the type of warning
                        reason: reason, // add the reason for the warning
                        mod_id: message.author.id
                    }).then(() => {
                        // Create the warn embed
                        const warnEmbed = {
                            color: 0xFF5500,
                            title: `A New Warning Was Issued To A User`,
                            author: {
                                name: message.author.username,
                                icon_url: message.author.displayAvatarURL(),
                            },
                            description: `${message.author} has added a warning to ${user}!`,
                            fields: [
                                {
                                    name: `User Warned`,
                                    value: `${user}`,
                                    inline: true,
                                },
                                {
                                    name: `Warned By`,
                                    value: `${message.author}`,
                                    inline: true,
                                },
                                {
                                    name: `Warning`,
                                    value: `${reason}`,
                                    inline: false,
                                },
                            ],
                            timestamp: new Date(),
                            footer: {
                                text: `Warning Id: ${warnId}`,
                            }
                        };

                        actionLog.send({embed: warnEmbed});
                    });
                });
            });

            // If no reason was given let the user know it is required
            } else {
                // Check if a user mention was used
                if(message.mentions.users.first()) {
                    // Let user know a reason is needed
                    message.reply(`uh oh! It seems you forgot to give a reason for warning, please be sure to provide a reason for this action!\nExample: \`${prefix}warn @${user.tag}, reason\``);

                // If no user mention was given then just output the id they provided
                } else {
                    // Let user know a reason is needed
                    message.reply(`uh oh! It seems you forgot to give a reason for warning, please be sure to provide a reason for this action!\nExample: \`${prefix}warn ${user}, reason\``);
                }
            }
        }
    }
}