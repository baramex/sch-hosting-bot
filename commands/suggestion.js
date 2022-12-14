const { ApplicationCommandOptionType, CommandInteraction } = require("discord.js");
const Suggestion = require("../modules/suggestion");

module.exports = {
    name: "suggestion",
    description: "Suggérer une idée.",
    options: [{
        name: "suggestion",
        description: "Votre suggestion.",
        type: ApplicationCommandOptionType.String,
        required: true
    }],
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    run: async (interaction) => {
        const content = interaction.options.get("suggestion", true).value;

        if (content.length >= 1024) throw new Error("Votre suggestion est trop longue !");

        await Suggestion.create(interaction.user, content);

        return interaction.reply({ content: `:white_check_mark: Votre suggestion a bien été envoyée !`, ephemeral: true })
    }
}