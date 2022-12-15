const { ApplicationCommandOptionType, CommandInteraction } = require("discord.js");
const Machine = require("../modules/machines");
const Subscription = require("../modules/subscriptions");
const Whitelist = require("../modules/whitelist");

module.exports = {
    name: "renew-subscription",
    description: "Permet de renouveler une souscription.",
    options: [{
        name: "ip",
        description: "L'ip de la machine.",
        type: ApplicationCommandOptionType.String,
        required: true
    },
    {
        name: "duration",
        description: "La durée du renouvellement, à partir de la date d'expiration (en jour).",
        type: ApplicationCommandOptionType.Number,
        required: true
    }],
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    run: async (interaction) => {
        if (!Whitelist.isWhitelisted(interaction.user.id)) throw new Error("Vous n'avez pas la permission d'utiliser cette commande !");

        const ip = interaction.options.get("ip", true).value;
        const duration = interaction.options.get("duration", true).value;

        const machine = Machine.get(ip);
        if (!machine) throw new Error("Cette machine n'existe pas !");
        if (!machine.subscription) throw new Error("Cette machine n'a aucune souscription actuelle.");
        machine.subscription.renew(duration);

        return interaction.reply({ embeds: [machine.subscription.generateEmbed], components: [machine.subscription.generateActionRow] });
    }
}