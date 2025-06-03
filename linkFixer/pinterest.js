const axios = require('axios');
const cheerio = require('cheerio');
const { EmbedBuilder } = require('discord.js');

module.exports = async function handlePinterest(message) {
    const pinterestLinkRegex = /(https:\/\/\w*\.pinterest\.com\/pin\/\d+)|(https:\/\/pin\.it\/\w+)/;
    const match = message.content.match(pinterestLinkRegex);

    if (!message.content.includes('<') && match) {
        let pinterestUrl = match[0].replace(/https:\/\/\w*\.pinterest\.com\//, 'https://pinterest.com/');

        // Wait for embed to show up then suppress
        const timeout = 10000;
        const pollInterval = 250;
        const start = Date.now();

        let suppressed = false;
        while (!suppressed && Date.now() - start < timeout) {
            try {
                const fetched = await message.channel.messages.fetch(message.id);
                const embedCount = fetched.embeds.length;
                console.log(`[${Date.now()}] Pinterest embed count: ${embedCount}`);

                if (embedCount > 0) {
                    await fetched.suppressEmbeds(true);
                    console.log("✅ Pinterest embed suppressed.");
                    suppressed = true;
                    break;
                }
            } catch (err) {
                console.error("❌ Pinterest fetch/suppress error:", err.message);
            }
            await new Promise(res => setTimeout(res, pollInterval));
        }

        try {
            const response = await axios.get(pinterestUrl);
            const html = response.data;

            if (html.includes('board-header')) {
                console.log('⚠️ Skipped: Board page.');
                return;
            }

            const $ = cheerio.load(html);
            const imageUrl = $('meta[property="og:image"]').attr('content');

            if (imageUrl) {
                const embed = new EmbedBuilder()
                    .setTitle(`Sent by ${message.author.username}`)
                    .setURL(pinterestUrl)
                    .setImage(imageUrl)
                    .setDescription('From Pinterest!')
                    .setColor('Blue')
                    .setFooter({ text: "Bot made with love and hate 💔" });

                await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
            } else {
                await message.reply({ content: 'No image found on Pinterest.', allowedMentions: { repliedUser: false } });
            }
        } catch (err) {
            console.error('Pinterest error:', err.message);
            await message.reply({ content: 'Error fetching Pinterest data.', allowedMentions: { repliedUser: false } });
        }
    }
};
