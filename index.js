require("dotenv").config();
const got = require("got");
const fs = require("fs");
const { ActivityType, Collection } = require("discord.js");
const client = require("./client");
const Suggestion = require("./modules/suggestion");
const JoinLog = require("./modules/joinLog");

const { FIVEM_IDS } = process.env;

/* FIVEM */
const FIVEM_ENDPOINT = "https://servers-frontend.fivem.net/api/servers/single";
const fivemIds = [...new Set(FIVEM_IDS?.replace(" ", "").split(",").filter(a => a))];

async function update() {
    if (fivemIds.length === 0) {
        client.user.setActivity(`${client.guild.memberCount} Member${client.guild.memberCount > 1 ? "s" : ""}`, { type: ActivityType.Watching });
    }
    else {
        let totalPlayers = 0;

        for (const id of fivemIds) {
            const details = (await got(FIVEM_ENDPOINT + "/" + id, { responseType: "json" }).catch(console.error))?.body?.Data;
            if (details && details.players) {
                totalPlayers += details.players.length;
            }
        }


        client.user.setActivity(`${totalPlayers} Joueur${totalPlayers > 1 ? "s" : ""}`, { type: ActivityType.Watching });
    }
}

/* EVENTS */
client.on("ready", () => {
    client.guild = client.guilds.cache.get(process.env.GUILD_ID);
    if (!client.guild) throw new Error("Invalid guild id.");

    update();
    setInterval(update, 1000 * 60 * 5);

    /* SPLASH COMMANDS */
    client.commands = new Collection();
    fs.readdir("./commands/", (err, files) => {
        if (err) return console.error(err);
        files.forEach(file => {
            if (!file.endsWith(".js")) return;
            let props = require(`./commands/${file}`);

            let c = client.guild.commands.cache.find(a => a.name == props.name);
            if (c) {
                client.guild.commands.edit(c, { description: props.description, options: props.options || [] }).catch(console.error);
            }
            else {
                client.guild.commands.create({
                    name: props.name,
                    description: props.description,
                    options: props.options || []
                }).catch(console.error);
            }

            client.commands.set(props.name, props);
        });
    });

    console.log("Bot ready !");
});

client.on("guildMemberAdd", async member => {
    await JoinLog.guildMemberAdd(member).catch(console.error);
});

client.on("guildMemberRemove", async member => {
    await JoinLog.guildMemberRemove(member).catch(console.error);
});

/* SPLASH COMMANDS */
client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;

    const cmd = client.commands.get(interaction.commandName);
    try {
        if (cmd) await cmd.run(interaction);
    }
    catch (err) {
        console.error("COMMAND ERROR", "Commande name: ", interaction.commandName, "Arguments: ", interaction.options.data.map(a => `${a.name}: ${a.value}`).join(" - "), "Error: ", err);
        interaction.reply({ content: ":x: " + (err.message || "Erreur inattendue."), ephemeral: true });
    }
});

/* INTERACTIONS */
client.on("interactionCreate", async interaction => {
    if (interaction.isButton()) {
        if (interaction.customId === "upvote") {
            try {
                const suggestion = Suggestion.load(interaction.message.id);
                if (suggestion) {
                    await suggestion.upVote(interaction.user.id);
                }

                interaction.reply({ content: ":white_check_mark: Votre vote a bien été pris en compte.", ephemeral: true });
            } catch (error) {
                interaction.reply({ content: ":x: Une erreur s'est produite.", ephemeral: true });
            }
        }
        else if (interaction.customId === "downvote") {
            try {
                const suggestion = Suggestion.load(interaction.message.id);
                if (suggestion) {
                    await suggestion.downVote(interaction.user.id);
                }

                interaction.reply({ content: ":white_check_mark: Votre vote a bien été pris en compte.", ephemeral: true });
            } catch (error) {
                interaction.reply({ content: ":x: Une erreur s'est produite.", ephemeral: true });
            }
        }
    }
});