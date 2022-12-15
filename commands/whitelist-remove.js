const { ApplicationCommandOptionType, CommandInteraction } = require("discord.js");
const Whitelist = require("../modules/whitelist");

module.exports = {
    name: "whitelist-remove",
    description: "Retirer un membre de la whitelist.",
    options: [{
        name: "user",
        description: "Le membre à retirer.",
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
        Whitelist.removeWhitelist(user.id);

        return interaction.reply({ content: ":white_check_mark: Membre retiré.", ephemeral: true });
    }
}