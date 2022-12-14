const { EmbedBuilder, Colors, GuildMember } = require("discord.js");
const client = require("../client");

const { JOIN_LOG_CHANNEL_ID } = process.env;

class JoinLog {
    static sendMessage({ embeds }) {
        const channel = client.guild.channels.cache.get(JOIN_LOG_CHANNEL_ID);
        if (!channel) return;

        return channel.send({ embeds });
    }

    static formatDate(time) {
        return "<t:" + Math.round(time / 1000) + ":f> (" + "<t:" + Math.round(time / 1000) + ":R>)";
    }

    /**
     * 
     * @param {GuildMember} member 
     */
    static guildMemberAdd(member) {
        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setAuthor({ name: member.user.tag + " a rejoint le serveur.", iconURL: member.user.avatarURL() })
            .setFooter({ text: "ID: " + member.id })
            .setFields([
                { name: "Compte créé le", value: JoinLog.formatDate(member.user.createdTimestamp), inline: true },
                { name: "Rejoint le", value: JoinLog.formatDate(member.joinedTimestamp), inline: true }
            ]);

        return JoinLog.sendMessage({ embeds: [embed] });
    }

    /**
     * 
     * @param {GuildMember} member 
     */
    static guildMemberRemove(member) {
        const embed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setAuthor({ name: member.user.tag + " a quitté le serveur.", iconURL: member.user.avatarURL() })
            .setFooter({ text: "ID: " + member.id })
            .setFields([
                { name: "Compte créé le", value: JoinLog.formatDate(member.user.createdTimestamp), inline: true },
                { name: "Rejoint le", value: JoinLog.formatDate(member.joinedTimestamp), inline: true },
                { name: "Quitté le", value: JoinLog.formatDate(Date.now()), inline: true }
            ]);

        return JoinLog.sendMessage({ embeds: [embed] });
    }
}

module.exports = JoinLog;