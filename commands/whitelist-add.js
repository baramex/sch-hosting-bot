const { ApplicationCommandOptionType, CommandInteraction } = require("discord.js");
const Whitelist = require("../modules/whitelist");

module.exports = {
    name: "whitelist-add",
    description: "Ajouter un membre à la whitelist.",
    options: [{
        name: "user",
        description: "Le membre à ajouter.",
        type: ApplicationCommandOptionType.User,
        required: true
    }],
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    run: async (interaction) => {
        if (!Whitelist.isWhitelisted(interaction.user.id)) throw new Error("Vous n'avez pas la permission d'utiliser cette commande !");

        const user = interaction.options.getUser("user", true);
        Whitelist.whitelist(user.id);

        return interaction.reply({ content: ":white_check_mark: Membre ajouté.", ephemeral: true });
    }
}