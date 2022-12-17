const { ApplicationCommandOptionType, CommandInteraction } = require("discord.js");
const Machine = require("../modules/machines");
const Subscription = require("../modules/subscriptions");
const Whitelist = require("../modules/whitelist");

module.exports = {
    name: "create-subscription",
    description: "Attribuer une machine à un membre.",
    options: [{
        name: "ip",
        description: "L'ip de la machine.",
        type: ApplicationCommandOptionType.String,
        required: true
    },
    {
        name: "user",
        description: "Le membre de destination.",
        type: ApplicationCommandOptionType.User,
        required: true
    },
    {
        name: "duration",
        description: "La durée (en jour).",
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
        const user = interaction.options.getMember("user", true);
        const duration = interaction.options.get("duration", true).value;

        const machine = Machine.get(ip);
        if (!machine) throw new Error("Cette machine n'existe pas !");
        if (machine.subscription) throw new Error("Cette machine est déjà attribuée à un <@" + machine.subscription.userId + "> ! (`/remove-subcription ip:" + machine.ip + "`)");

        const subscription = Subscription.create(machine.id, user.id, Date.now() + duration * 24 * 60 * 60 * 1000);

        try {
            await subscription.sendMp("Votre souscription a tout juste été créée !", true);
            return interaction.reply({ embeds: [machine.subscription.generateEmbed()] });
        } catch (error) {
            return interaction.reply({ content: ":warning: Le message mp n'a pas pu être envoyé au possesseur de la machine.", embeds: [machine.subscription.generateEmbed()] });
        }
    }
}