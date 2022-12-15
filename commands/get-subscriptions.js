const { ApplicationCommandOptionType, CommandInteraction } = require("discord.js");
const Machine = require("../modules/machines");
const Subscription = require("../modules/subscriptions");
const Whitelist = require("../modules/whitelist");

module.exports = {
    name: "get-subscriptions",
    description: "Permet de récupérer une(des) souscription(s), soit par l'ip d'une machine, soit par un utilisateur.",
    options: [{
        name: "ip",
        description: "Rechercher par l'ip d'une machine.",
        type: ApplicationCommandOptionType.String
    },
    {
        name: "user",
        description: "Rechercher par un utilisateur.",
        type: ApplicationCommandOptionType.User
    }],
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    run: async (interaction) => {
        if (!Whitelist.isWhitelisted(interaction.user.id)) throw new Error("Vous n'avez pas la permission d'utiliser cette commande !");

        const ip = interaction.options.get("ip", false)?.value;
        const user = interaction.options.getMember("user", false);

        if (ip && user) throw new Error("Vous ne pouvez pas rechercher par l'ip et par un utilisateur en même temps !");
        if (!ip && !user) throw new Error("Vous devez rechercher par l'ip ou par un utilisateur !");

        if (ip) {
            const machine = Machine.get(ip);
            if (!machine) throw new Error("Cette machine n'existe pas !");
            if (!machine.subscription) throw new Error("Cette machine n'a aucune souscription actuelle.");

            return interaction.reply({ embeds: [machine.subscription.generateEmbed("ip")] });
        }
        else if (user) {
            const subscriptions = Subscription.getAllByUserId(user.id);
            if (!subscriptions.length) throw new Error("Cet utilisateur n'a aucune souscription actuelle.");

            return interaction.reply({ embeds: subscriptions.map(a => a.generateEmbed("user")) });
        }
    }
}