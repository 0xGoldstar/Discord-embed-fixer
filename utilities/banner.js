const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banner')
        .setDescription('Show user banner.')
        .addUserOption(option => option.setName('user').setDescription('The user whose banner you want to see')),
    async execute(interaction) {
        const guildId = interaction.guildId;

        if (!guildId) {
            await interaction.reply('This command can only be used in a server.');
            return;
        }

        const user = interaction.options.getUser('user') || interaction.member.user;
        await user.fetch();
        const banner = user.bannerURL({ size: 1024, dynamic: true });

        if (banner) {
            const response = new EmbedBuilder()
                .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
                .setImage(banner)
                .setFooter({ text: "Bot made with love and hate 💔" })
                //.setColor("RANDOM")
                .setTitle(`${user.username}'s banner`);

            await interaction.reply({ embeds: [response] });
        } else {
            await interaction.reply({
                content: user.id === interaction.user.id ? 'You should get Discord Nitro.' : `${user.tag} should get Discord Nitro.`,
                allowedMentions: { repliedUser: false }
            });
        }
    },
};
