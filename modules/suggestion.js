const { Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors } = require("discord.js");
const client = require("../client");
const { suggestions } = require("./database");

const { SUGGESTION_CHANNEL_ID } = process.env;

class Suggestion {
    constructor({ messageId, upVotes, downVotes, author: { avatarUrl, tag }, content, acceptedBy, refusedBy, comment }) {
        this.messageId = messageId;
        this.upVotes = upVotes;
        this.downVotes = downVotes;
        this.author = { avatarUrl, tag };
        this.content = content;
        this.acceptedBy = acceptedBy;
        this.refusedBy = refusedBy;
        this.comment = comment;
    }

    get answered() {
        return this.acceptedBy || this.refusedBy || this.comment;
    }

    /**
     * 
     * @returns {Promise<Message>}
     */
    async getMessage() {
        const channel = client.guild.channels.cache.get(SUGGESTION_CHANNEL_ID);
        if (channel) return channel.messages.cache.get(this.messageId) || await channel.messages.fetch(this.messageId);
    }

    generateEmbed() {
        const embed = new EmbedBuilder()
            .setAuthor({ name: this.author.tag + " a fait une suggestion.", iconURL: this.author.avatarUrl })
            .setDescription(this.content)
            .setColor(this.answered ? this.acceptedBy ? Colors.Green : Colors.Red : Colors.Blurple)

        if (this.acceptedBy) embed.addFields({ name: "Acceptée par", value: this.acceptedBy, inline: true });
        else if (this.refusedBy) embed.addFields({ name: "Refusée par", value: this.refusedBy, inline: true });
        if (this.comment) embed.addFields({ name: "Commentaire", value: this.comment, inline: true });

        return embed;
    }

    generateActionRow() {
        return new ActionRowBuilder().setComponents(
            new ButtonBuilder().setCustomId("upvote").setLabel(this.upVotes.length.toString()).setEmoji("🔼").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("downvote").setLabel(this.downVotes.length.toString()).setEmoji("🔽").setStyle(ButtonStyle.Danger),
        )
    }

    async updateMessage() {
        const message = await this.getMessage();
        if (message) return message.edit({ embeds: [this.generateEmbed()], components: [this.generateActionRow()] });
    }

    async accept(username, comment) {
        if (this.answered) throw new Error("Cette suggestion a déjà été acceptée ou refusée !");

        this.acceptedBy = username;
        this.comment = comment;

        await this.save();
    }

    async refuse(username, comment) {
        if (this.answered) throw new Error("Cette suggestion a déjà été acceptée ou refusée !");

        this.refusedBy = username;
        this.comment = comment;

        await this.save();
    }

    async upVote(id) {
        if (this.downVotes.includes(id)) this.downVotes.splice(this.downVotes.indexOf(id), 1);
        if (this.upVotes.includes(id)) this.upVotes.splice(this.upVotes.indexOf(id), 1);
        else this.upVotes.push(id);

        await this.save();
    }

    async downVote(id) {
        if (this.upVotes.includes(id)) this.upVotes.splice(this.upVotes.indexOf(id), 1);
        if (this.downVotes.includes(id)) this.downVotes.splice(this.downVotes.indexOf(id), 1);
        else this.downVotes.push(id);

        await this.save();
    }

    async save(edit = true) {
        const suggestion = suggestions.get("suggestions").find({ messageId: this.messageId });
        if (suggestion.value()) suggestion.assign(this).write();
        else suggestions.get("suggestions").push(this).write();

        if (edit) await this.updateMessage();
    }

    static load(messageId) {
        const suggestion = suggestions.get("suggestions").find({ messageId }).value();
        if (suggestion) return new Suggestion(suggestion);
    }

    static async create(author, content) {
        const suggestion = new Suggestion({
            messageId: null,
            upVotes: [],
            downVotes: [],
            acceptedBy: null,
            refusedBy: null,
            comment: null,
            author: {
                avatarUrl: author.avatarURL(),
                tag: author.tag,
            },
            content: content
        });

        const channel = client.guild.channels.cache.get(SUGGESTION_CHANNEL_ID);
        if (!channel) return;

        const message = await channel.send({
            embeds: [suggestion.generateEmbed()],
            components: [suggestion.generateActionRow()]
        });

        suggestion.messageId = message.id;
        await suggestion.save(false);

        return suggestion;
    }
}

module.exports = Suggestion;