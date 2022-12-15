const { EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const client = require("../client");
const { formatDate } = require("../utils/date");
const { subscriptions } = require("./database");
const Machine = require("./machines");

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
        if (this._machine) return this._machine;
        this._machine = Machine.getById(this.machineId);
        return this._machine;
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

    generateEmbed(command = "") {
        return new EmbedBuilder()
            .setAuthor({ name: "Abonnement de " + this.member.user.tag, iconURL: this.member.user.avatarURL() })
            .setColor(Colors.DarkButNotBlack)
            .addFields(
                { name: "ID de l'abonnement", value: this.id, inline: true },
                { name: "ID de la machine", value: this.machineId, inline: true },
                { name: "Machine", value: this.machine.ip + " | " + this.machine.name, inline: true },
                { name: "Expire le", value: formatDate(this.expiresAt), inline: true },
                { name: "Abonné depuis", value: formatDate(this.createdAt), inline: true },
                { name: "Commandes liées", value: (command === "ip" ? "- `/get-subscriptions user:<@" + this.userId + ">" : "- `/get-subscriptions ip:" + this.machine.ip) + "`\n- `/renew-subscription ip:" + this.machine.ip + " duration:`\n- `/remove-subscription ip:" + this.machine.ip + "`\n- `/get-machine ip:" + this.machine.ip + "`", inline: true }
            );
    }

    save() {
        const subscription = subscriptions.get("subscriptions").find({ id: this.id });
        if (subscription.value()) subscription.assign(this).write();
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