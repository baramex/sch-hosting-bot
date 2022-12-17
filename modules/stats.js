const { PermissionsBitField, ChannelType } = require("discord.js");
const client = require("../client");
const { stats } = require("./database");
const Machine = require("./machines");

class Stats {
    static async update() {
        const parent = process.env.STATS_PARENT_ID;
        const statsObject = {
            members: { text: "📊・Membres: ", value: client.guild.memberCount, channel: client.guild.channels.cache.get(stats.get("members").value()) || await client.guild.channels.create({ name: "pending", parent: parent, type: ChannelType.GuildVoice, permissionOverwrites: [{ id: client.guild.id, deny: PermissionsBitField.Flags.Connect }] }) },
            clients: { text: "🤝・Clients: ", value: Machine.countClients(), channel: client.guild.channels.cache.get(stats.get("clients").value()) || await client.guild.channels.create({ name: "pending", parent: parent, type: ChannelType.GuildVoice, permissionOverwrites: [{ id: client.guild.id, deny: PermissionsBitField.Flags.Connect }] }) },
        };
        for (const [name, { text, value, channel }] of Object.entries(statsObject)) {
            if (stats.get(name).value() !== channel.id) stats.assign({[name]: channel.id}).write();

            await channel.setName(text + value);
        }
    }
}

module.exports = Stats;