const { CommandInteraction } = require("discord.js");
const Subscription = require("../modules/subscriptions");

module.exports = {
    name: "get-my-subscriptions",
    description: "Permet de récupérer ses souscriptions.",
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    run: async (interaction) => {
        const subscriptions = Subscription.getAllByUserId(interaction.user.id);
        if (!subscriptions.length) throw new Error("Vous n'avez aucune souscription.");

        return interaction.reply({ embeds: subscriptions.map(a => a.generateEmbed("user", false)), ephemeral: true });
    }
}