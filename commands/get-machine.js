const { ApplicationCommandOptionType, CommandInteraction } = require("discord.js");
const Machine = require("../modules/machines");
const Whitelist = require("../modules/whitelist");

module.exports = {
    name: "get-machine",
    description: "Permet de récupérer les informations concernant une machine.",
    options: [{
        name: "ip",
        description: "Rechercher par l'ip d'une machine.",
        type: ApplicationCommandOptionType.String,
        required: true
    }],
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    run: async (interaction) => {
        if (!Whitelist.isWhitelisted(interaction.user.id)) throw new Error("Vous n'avez pas la permission d'utiliser cette commande !");

        const ip = interaction.options.get("ip", false)?.value;

        const machine = Machine.get(ip);
        if (!machine) throw new Error("Cette machine n'existe pas !");

        return interaction.reply({ embeds: [machine.generateEmbed()] });
    }
}