const { EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const client = require("../client");
const { formatDate } = require("../utils/date");
const { subscriptions } = require("./database");
const Machine = require("./machines");
const Whitelist = require("./whitelist");

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

    generateEmbed(command = "", permissions = true) {
        return new EmbedBuilder()
            .setAuthor({ name: "Abonnement de " + this.member.user.tag, iconURL: this.member.user.avatarURL() })
            .setColor(Colors.DarkButNotBlack)
            .addFields(
                { name: "ID de l'abonnement", value: this.id, inline: true },
                { name: "ID de la machine", value: this.machineId, inline: true },
                { name: "Machine", value: this.machine.ip + " | " + this.machine.name, inline: true },
                { name: "Expire le", value: formatDate(this.expiresAt), inline: true },
                { name: "Abonné depuis", value: formatDate(this.createdAt), inline: true },
                { name: "Commandes liées", value: (permissions ? (command === "ip" ? "- `/get-subscriptions user:<@" + this.userId + ">" : "- `/get-subscriptions ip:" + this.machine.ip) + "`\n- `/renew-subscription ip:" + this.machine.ip + " duration:`\n- `/remove-subscription ip:" + this.machine.ip + "`\n" : "") + "- `/get-machine ip:" + this.machine.ip + "`", inline: true }
            );
    }

    async sendMp(description, sendToWl = false) {
        const member = client.guild.members.cache.get(this.userId);
        if (!member) throw new Error("Membre non trouvé.");

        const toSend = [member];
        if (sendToWl) {
            toSend.push(...Whitelist.getAllMembers());
        }

        const embed = this.generateEmbed("user", false).setDescription(description);
        const embedWl = this.generateEmbed("user", true).setDescription(description + "\n*Ceci est un message envoyé à tous les membres de la whitelist ainsi que le possesseur de la machine.*");

        for (const mem of toSend) {
            if (mem.id === member.id) await mem.send({ embeds: [embed] });
            else mem.send({ embeds: [embedWl] }).catch(() => { });
        }
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

function update() {
    for (let s of subscriptions.get("subscriptions").value()) {
        const subscription = new Subscription(s);

        const expired = subscription.expired;
        const willBeExpiredIn12H = subscription.willBeExpired(0.5);
        const willBeExpiredIn24H = subscription.willBeExpired(1);
        const willBeExpiredIn4D12H = subscription.willBeExpired(4.5);
        const willBeExpiredIn5D = subscription.willBeExpired(5);

        if (!expired && willBeExpiredIn24H && !willBeExpiredIn12H) subscription.sendMp("Votre abonnement expirera dans moins d'un jour.", true);
        if (!expired && willBeExpiredIn5D && !willBeExpiredIn4D12H) subscription.sendMp("Votre abonnement expirera dans moins de 5 jours.", true);
    }
    setTimeout(update, 1000 * 60 * 60 * 12);
}
setTimeout(update, 1000 * 10);

module.exports = Subscription;