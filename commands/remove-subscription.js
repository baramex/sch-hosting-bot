const { ApplicationCommandOptionType, CommandInteraction } = require("discord.js");
const Machine = require("../modules/machines");
const Whitelist = require("../modules/whitelist");

module.exports = {
    name: "remove-subscription",
    description: "Supprimer une souscription d'une machine.",
    options: [{
        name: "ip",
        description: "L'ip de la machine.",
        type: ApplicationCommandOptionType.String,
        required: true
    }],
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    run: async (interaction) => {
        if (!Whitelist.isWhitelisted(interaction.user.id)) throw new Error("Vous n'avez pas la permission d'utiliser cette commande !");

        const ip = interaction.options.get("ip", true).value;

        const machine = Machine.get(ip);
        if (!machine) throw new Error("Cette machine n'existe pas !");
        if (!machine.subscription) throw new Error("Cette machine n'a aucune souscription actuelle.");

        try {
            await machine.subscription.sendMp("Votre souscription a été supprimée !", true);
            machine.subscription.remove();
            return interaction.reply({ content: ":white_check_mark: La souscription a été supprimée." });
        } catch (error) {
            return interaction.reply({ content: ":white_check_mark: La souscription a été supprimée.\n:warning: Le message mp n'a pas pu être envoyé au possesseur de la machine." });
        }
    }
}