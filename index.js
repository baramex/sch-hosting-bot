const got = require("got");
const { ActivityType } = require("discord.js");
const Discord = require("discord.js");
require("dotenv").config();

const client = new Discord.Client({
    intents: []
});

const FIVEM_ENDPOINT = "https://servers-frontend.fivem.net/api/servers/single";
const fivemIds = [...new Set(process.env.FIVEM_IDS?.replace(" ", "").split(",").filter(a => a))];

client.on("ready", () => {
    update();
    setInterval(update, 1000 * 60 * 5);
});

async function update() {
    let totalPlayers = 0;

    for (const id of fivemIds) {
        const details = (await got(FIVEM_ENDPOINT + "/" + id, { responseType: "json" }).catch(console.error))?.body?.Data;
        if (details && details.players) {
            totalPlayers += details.players.length;
        }
    }

    client.user.setActivity(`${totalPlayers} Joueur${totalPlayers > 1 ? "s" : ""}`, { type: ActivityType.Watching });
}

client.login(process.env.BOT_TOKEN);