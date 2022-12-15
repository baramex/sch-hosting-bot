const { ApplicationCommandOptionType, CommandInteraction } = require("discord.js");
const Machine = require("../modules/machines");
const Subscription = require("../modules/subscriptions");
const Whitelist = require("../modules/whitelist");

module.exports = {
    name: "create-machine",
    description: "Permet de créer une machine.",
    options: [{
        name: "ip",
        description: "L'ip de la machine.",
        type: ApplicationCommandOptionType.String,
        required: true
    },
    {
        name: "name",
        description: "Le nom de la machine.",
        type: ApplicationCommandOptionType.String,
        required: true
    },
    {
        name: "txadmin_link",
        description: "Le lien de TXADMIN.",
        type: ApplicationCommandOptionType.String,
        required: true
    },
    {
        name: "txadmin_pin",
        description: "Le code pin de TXADMIN.",
        type: ApplicationCommandOptionType.String,
        required: true
    },
    {
        name: "sftpssh_root_password",
        description: "Le mot de passe du compte root sftp/ssh.",
        type: ApplicationCommandOptionType.String,
        required: true
    },
    {
        name: "sftpssh_fivem_password",
        description: "Le mot de passe du compte fivem sftp/ssh.",
        type: ApplicationCommandOptionType.String,
        required: true
    },
    {
        name: "db_root_password",
        description: "Le mot de passe du compte root mariadb/phpmyadmin.",
        type: ApplicationCommandOptionType.String,
        required: true
    },
    {
        name: "db_fivem_password",
        description: "Le mot de passe du compte fivem mariadb/phpmyadmin.",
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
        const name = interaction.options.get("name", true).value;
        const txadminLink = interaction.options.get("txadmin_link", true).value;
        const txadminPin = interaction.options.get("txadmin_pin", true).value;
        const sftpsshRootPassword = interaction.options.get("sftpssh_root_password", true).value;
        const sftpsshFivemPassword = interaction.options.get("sftpssh_fivem_password", true).value;
        const dbRootPassword = interaction.options.get("db_root_password", true).value;
        const dbFivemPassword = interaction.options.get("db_fivem_password", true).value;

        if (!/^([0-9]{1,3}\.){3}([0-9]{1,3})$/.test(ip)) throw new Error("L'ip est invalide !");

        const machine = Machine.create(ip, name, [{ type: "sftp/ssh", username: "root", password: sftpsshRootPassword }, { type: "sftp/ssh", username: "fivem", password: sftpsshFivemPassword }, { type: "mariadb/phpmyadmin", username: "root", password: dbRootPassword }, { type: "mariadb/phpmyadmin", username: "fivem", password: dbFivemPassword }], { link: txadminLink, pinCode: txadminPin });

        return interaction.reply({ embeds: [machine.generateEmbed()] });
    }
}