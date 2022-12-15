const { EmbedBuilder, Colors } = require("discord.js");
const { formatDate } = require("../utils/date");
const { machines } = require("./database");

class Machine {
    constructor({ id, ip, name, users, txadmin: { link, pinCode } }) {
        this.id = id;
        this.ip = ip;
        this.name = name;
        this.users = users;
        this.txadmin = { link, pinCode };
    }

    addUser({ type, username, password }) {
        this.users.push({ type, username, password });
        this.save();
    }

    removeUser(type, username) {
        this.users = this.users.filter(user => user.type !== type || user.username !== username);
        this.save();
    }

    generateEmbed() {
        return new EmbedBuilder()
            .setColor(Colors.DarkButNotBlack)
            .setTitle("Machine - " + this.ip)
            .setFields(
                { name: "ID", value: this.id, inline: true },
                { name: "IP", value: this.ip, inline: true },
                { name: "Nom", value: this.name, inline: true },
                { name: "Utilisateurs", value: (this.users.map(user => `- **${user.type}** - username: *${user.username}* | password: *||${user.password}||*`).join("\n") + "\n\nLien phpmyadmin: " + this.phpmyadminLink) || "Aucun utilisateur" },
                { name: "TxAdmin", value: `Lien: ${this.txadmin.link}\nCode PIN: ${this.txadmin.pinCode}`, inline: true },
                { name: "Abonnement", value: this.subscription ? `Utilisateur: <@${this.subscription.userId}>\nExpiration: ${formatDate(this.subscription.expiresAt)}` : "Aucun abonnement", inline: true },
                { name: "Commandes liées", value: `- \`/get-subscriptions ip:${this.ip}\`\n- \`/create-subscription ip:${this.ip} user: duration:\`\n- \`/remove-subscription ip:${this.ip}\`\n- \`/renew-subscription ip:${this.ip} duration:\``, inline: true }
            )
    }

    get phpmyadminLink() {
        return `http://${this.ip}/phpmyadmin/`;
    }

    get subscription() {
        if (this._subscription) return this._subscription;
        this._subscription = require("./subscriptions").getByMachineId(this.id);
        return this._subscription;
    }

    save() {
        const machine = machines.get("machines").find({ id: this.id });
        if (machine.value()) machine.assign(this).write();
        else machines.get("machines").push(this).write();
    }

    static get(ip) {
        const machine = machines.get("machines").find({ ip }).value();
        if (!machine) return;
        return new Machine(machine);
    }

    static getById(id) {
        const machine = machines.get("machines").find({ id }).value();
        if (!machine) return;
        return new Machine(machine);
    }

    static create(ip, name, users, { link, pinCode }) {
        const machine = new Machine({ id: Math.random().toString(16).slice(-8), ip, name, users, txadmin: { link, pinCode } });

        machine.save();

        return machine;
    }
}

module.exports = Machine;