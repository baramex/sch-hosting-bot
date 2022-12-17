const client = require("../client.js");
const { whitelist } = require("./database.js");

class Whitelist {
    static isWhitelisted(id) {
        return whitelist.get("whitelist").includes(id).value();
    }

    static whitelist(id) {
        if (whitelist.get("whitelist").includes(id).value()) return;
        whitelist.get("whitelist").push(id).write();
    }

    static removeWhitelist(id) {
        whitelist.get("whitelist").pull(id).write();
    }

    static getAllMembers() {
        return whitelist.get("whitelist").value().map(a => client.guild.members.cache.get(a)).filter(a => a);
    }
}

module.exports = Whitelist;