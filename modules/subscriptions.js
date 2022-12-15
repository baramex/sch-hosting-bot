const { EmbedBuilder, Colors } = require("discord.js");
const client = require("../client");
const { formatDate } = require("../utils/date");
const Machine = require("./machines");

const subscriptions = require("lowdb")(new (require("lowdb/adapters/FileSync"))("./databases/subscriptions.json"));
subscriptions.defaults({ subscriptions: [] }).write();

class Subscription {
    constructor({ id, machineId, userId, expiresAt, createdAt }) {
        this.id = id;
        this.machineId = machineId;
        this.userId = userId;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt;
    }

    get member() {
        return client.guild.members.cache.get(this.userId);
    }

    get machine() {
        return Machine.get(this.machineId);
    }

    get expired() {
        return this.expiresAt < Date.now();
    }

    // TODO: interval checker
    remove() {
        // TODO: send message to the user
        subscriptions.get("subscriptions").remove({ id: this.id }).write();
    }

    renew(days) {
        // TODO: send message to the user
        this.expiresAt = this.expired ? Date.now() + days * 24 * 60 * 60 * 1000 : this.expiresAt + days * 24 * 60 * 60 * 1000;
        this.save();
    }

    willBeExpired(inDay) {
        return this.expiresAt < Date.now() + (inDay * 24 * 60 * 60 * 1000);
    }

    generateEmbed() {
        return new EmbedBuilder()
            .setAuthor({ name: "Abonnement de " + this.member.user.tag, iconURL: this.member.user.avatarURL })
            .setColor(Colors.DarkButNotBlack)
            .addFields(
                { name: "ID de l'abonnement", value: this.id, inline: true },
                { name: "ID de la machine", value: this.machineId, inline: true },
                { name: "Expire le", value: formatDate(this.expiresAt), inline: true },
                { name: "Abonné depuis", value: formatDate(this.createdAt), inline: true },
                { name: "IP de la machine", value: this.machine.ip, inline: true },
            );
    }

    generateActionRow() {
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("subscription-renew-" + this.id)
                    .setLabel("Renouveler")
                    .setStyle("PRIMARY"),
                new ButtonBuilder()
                    .setCustomId("subscription-remove-" + this.id)
                    .setLabel("Supprimer")
                    .setStyle("DANGER")
            );
    }

    save() {
        const subscription = subscriptions.get("subscriptions").find({ ip }).value();
        if (subscription) subscriptions.get("subscriptions").find({ id: this.id }).assign(this).write();
        else subscriptions.get("subscriptions").push(this).write();
    }

    static getAllByUserId(userId, requiresBeActivated = false) {
        let subscription = subscriptions.get("subscriptions").filter({ userId }).value();
        if (!subscription) return;
        if (requiresBeActivated) subscription = subscription.filter(sub => sub.expiresAt >= Date.now());
        return subscription.map(sub => new Subscription(sub));
    }

    static getByMachineId(machineId, requiresBeActivated = false) {
        const subscription = subscriptions.get("subscriptions").find({ machineId }).value();
        if (!subscription || (requiresBeActivated && subscription.expiresAt < Date.now())) return;
        return new Subscription(subscription);
    }

    static get(id, requiresBeActivated = false) {
        const subscription = subscriptions.get("subscriptions").find({ id }).value();
        if (!subscription || (requiresBeActivated && subscription.expiresAt < Date.now())) return;
        return new Subscription(subscription);
    }

    static create(machineId, userId, expiresAt) {
        const subscription = new Subscription({
            id: Math.random().toString(16).slice(-8), machineId, userId, expiresAt, createdAt: Date.now()
        });

        subscription.save();

        return subscription;
    }
}

module.exports = Subscription;