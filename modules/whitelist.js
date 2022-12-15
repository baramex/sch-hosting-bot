const whitelist = require("lowdb")(new (require("lowdb/adapters/FileSync"))("./databases/whitelist.json"));
whitelist.defaults({ whitelist: ["938691020714016808"] }).write();

class Whitelist {
    static isWhitelisted(id) {
        return whitelist.get("whitelist").find({ id }).value();
    }

    static whitelist(id) {
        whitelist.get("whitelist").push({ id }).write();
    }

    static removeWhitelist(id) {
        whitelist.get("whitelist").remove({ id }).write();
    }
}

module.exports = Whitelist;