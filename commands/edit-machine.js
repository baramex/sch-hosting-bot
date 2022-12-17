const { ApplicationCommandOptionType, CommandInteraction } = require("discord.js");
const Machine = require("../modules/machines");
const Whitelist = require("../modules/whitelist");

module.exports = {
    name: "edit-machine",
    description: "Permet de modifier une machine.",
    options: [{
        name: "ip",
        description: "L'ip de la machine à modifier.",
        type: ApplicationCommandOptionType.String,
        required: true
    },
    {
        name: "name",
        description: "Le nom de la machine.",
        type: ApplicationCommandOptionType.String
    },
    {
        name: "txadmin_link",
        description: "Le lien de TXADMIN.",
        type: ApplicationCommandOptionType.String
    },
    {
        name: "txadmin_pin",
        description: "Le code pin de TXADMIN.",
        type: ApplicationCommandOptionType.String
    },
    {
        name: "sftpssh_root_password",
        description: "Le mot de passe du compte root sftp/ssh.",
        type: ApplicationCommandOptionType.String
    },
    {
        name: "sftpssh_fivem_password",
        description: "Le mot de passe du compte fivem sftp/ssh.",
        type: ApplicationCommandOptionType.String
    },
    {
        name: "db_root_password",
        description: "Le mot de passe du compte root mariadb/phpmyadmin.",
        type: ApplicationCommandOptionType.String
    },
    {
        name: "db_fivem_password",
        description: "Le mot de passe du compte fivem mariadb/phpmyadmin.",
        type: ApplicationCommandOptionType.String
    }],
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    run: async (interaction) => {
        if (!Whitelist.isWhitelisted(interaction.user.id)) throw new Error("Vous n'avez pas la permission d'utiliser cette commande !");

        const ip = interaction.options.get("ip", true).value;
        const name = interaction.options.get("name", false)?.value;
        const txadminLink = interaction.options.get("txadmin_link", false)?.value;
        const txadminPin = interaction.options.get("txadmin_pin", false)?.value;
        const sftpsshRootPassword = interaction.options.get("sftpssh_root_password", false)?.value;
        const sftpsshFivemPassword = interaction.options.get("sftpssh_fivem_password", false)?.value;
        const dbRootPassword = interaction.options.get("db_root_password", false)?.value;
        const dbFivemPassword = interaction.options.get("db_fivem_password", false)?.value;

        const machine = Machine.get(ip);

        if (!machine) throw new Error("Cette machine n'existe pas !");

        if (name) machine.name = name;
        if (txadminLink) machine.txadminLink = txadminLink;
        if (txadminPin) machine.txadminPin = txadminPin;
        if (sftpsshRootPassword) machine.sftpsshRootPassword = sftpsshRootPassword;
        if (sftpsshFivemPassword) machine.sftpsshFivemPassword = sftpsshFivemPassword;
        if (dbRootPassword) machine.dbRootPassword = dbRootPassword;
        if (dbFivemPassword) machine.dbFivemPassword = dbFivemPassword;

        machine.save();

        return interaction.reply({ embeds: [machine.generateEmbed()] });
    }
}