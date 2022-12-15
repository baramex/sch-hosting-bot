const subscriptions = require("lowdb")(new (require("lowdb/adapters/FileSync"))("./databases/subscriptions.json"));
subscriptions.defaults({ subscriptions: [] }).write();

const machines = require("lowdb")(new (require("lowdb/adapters/FileSync"))("./databases/machines.json"));
machines.defaults({ machines: [] }).write();

const suggestions = require("lowdb")(new (require("lowdb/adapters/FileSync"))("./databases/suggestions.json"));
suggestions.defaults({ suggestions: [] }).write();

const whitelist = require("lowdb")(new (require("lowdb/adapters/FileSync"))("./databases/whitelist.json"));
whitelist.defaults({ whitelist: ["938691020714016808"] }).write();

module.exports = { subscriptions, machines, suggestions, whitelist };