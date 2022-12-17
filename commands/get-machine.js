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
        const ip = interaction.options.get("ip", false)?.value;
        const machine = Machine.get(ip);
        const whitelist = Whitelist.isWhitelisted(interaction.user.id);
        if (!whitelist && (machine.subscription ? machine.subscription.userId !== interaction.user.id : true)) throw new Error("Vous n'avez pas la permission de voir cette machine !");

        if (!machine) throw new Error("Cette machine n'existe pas !");

        return interaction.reply({ embeds: [machine.generateEmbed(whitelist)], ephemeral: !whitelist });
    }
}