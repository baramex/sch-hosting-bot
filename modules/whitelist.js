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
}

module.exports = Whitelist;