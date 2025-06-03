const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Show user avatar.')
        .addStringOption(option => 
            option.setName('type')
                .setDescription('The type of avatar to show (server or global)')
                .addChoices(
                    { name: 'Server', value: 'server' },
                    { name: 'Global', value: 'global' }
                )
                .setRequired(true))
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to get the avatar from')
                .setRequired(false)),
    async execute(interaction) {
        const member = interaction.options.getMember('user') || interaction.member;
        const guildId = interaction.guildId;

        if (!guildId) {
            await interaction.reply('This command can only be used in a server.');
            return;
        }

        const type = interaction.options.getString('type');
        let avatarURL;

        if (type === 'server') {
            avatarURL = member.displayAvatarURL({ size: 512, dynamic: true });
        } else {
            avatarURL = member.user.displayAvatarURL({ size: 512, dynamic: true });
        }

        const user = member.user;

        const response = new EmbedBuilder()
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
            .setTitle(`${user.username}'s Avatar`)
            .setImage(avatarURL)
            .setFooter({ text: "Bot made with love and hate 💔" });

        await interaction.reply({ embeds: [response] });
    },
};
