const { ApplicationCommandOptionType, CommandInteraction, PermissionsBitField } = require("discord.js");
const Suggestion = require("../modules/suggestion");

module.exports = {
    name: "refuse",
    description: "Refuser une suggestion.",
    options: [{
        name: "message_id",
        description: "L'id du message de la suggestion.",
        type: ApplicationCommandOptionType.String,
        required: true
    },
    {
        name: "comment",
        description: "Commentaire du refus.",
        type: ApplicationCommandOptionType.String
    }],
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    run: async (interaction) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) throw new Error("Vous n'avez pas la permission d'utiliser cette commande !");

        const id = interaction.options.get("message_id", true).value;
        const comment = interaction.options.get("comment", false)?.value;

        if (comment?.length >= 1024) throw new Error("Votre commentaire est trop long !");

        const suggestion = Suggestion.load(id);
        if (!suggestion) throw new Error("Cette suggestion n'existe pas !");

        await suggestion.refuse(interaction.user.username, comment);

        return interaction.reply({ content: `:white_check_mark: Votre suggestion a bien été envoyée !`, ephemeral: true })
    }
}