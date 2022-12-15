const Subscription = require("./subscriptions");

const machines = require("lowdb")(new (require("lowdb/adapters/FileSync"))("./databases/machines.json"));
machines.defaults({ machines: [] }).write();

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

    get subscription() {
        return Subscription.getByMachineId(this.id, true);
    }

    save() {
        const machine = machines.get("machines").find({ ip }).value();
        if (machine) machines.get("machines").find({ id: this.id }).assign(this).write();
        else machines.get("machines").push(this).write();
    }

    static get(ip) {
        const machine = machines.get("machines").find({ ip }).value();
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