const axios = require('axios');
const cheerio = require('cheerio');
const { EmbedBuilder } = require('discord.js');

module.exports = async function handlePixiv(message) {
    if (!message.content.includes('<') && /www\.pixiv\.net/.test(message.content)) {
        const links = message.content.match(/https?:\/\/www\.pixiv\.net[^\s]+/gi) || [];
        let modified = message.content;

        for (const link of links) {
            const fixed = link.replace(/www\.pixiv\.net/gi, 'www.phixiv.net');
            modified = modified.replace(link, `[⠀](${fixed})`);
        }

        // Poll for embed for up to 10 seconds because sometimes embeds take a while to load
        const timeout = 10000;
        const pollInterval = 250;
        const start = Date.now();

        let suppressed = false;
        while (!suppressed && Date.now() - start < timeout) {
            try {
                const fetched = await message.channel.messages.fetch(message.id);
                const embedCount = fetched.embeds.length;
                console.log(`[${Date.now()}] Embed count: ${embedCount}`);

                if (embedCount > 0) {
                    await fetched.suppressEmbeds(true);
                    console.log("✅ Embed suppressed.");
                    suppressed = true;
                    break;
                }
            } catch (err) {
                console.error("❌ Failed to fetch or suppress:", err.message);
            }
            await new Promise(res => setTimeout(res, pollInterval));
        }

        // Fetch preview and send custom embed
        try {
            const originalLink = links[0];
            const modifiedLink = originalLink.replace(/www\.pixiv\.net/gi, 'www.phixiv.net'); // modified link for image

            const res = await axios.get(modifiedLink);
            const html = res.data;
            const $ = cheerio.load(html);
            const imageUrl = $('meta[property="og:image"]').attr('content');

            if (imageUrl) {
                const embed = new EmbedBuilder()
                    .setTitle(`Sent by ${message.author.username}`)
                    .setURL(originalLink)
                    .setImage(imageUrl) 
                    .setDescription('From Pixiv!')
                    .setColor('Blue')
                    .setFooter({ text: "Bot made with love and hate 💔" });

                await message.reply({ content: modified, embeds: [embed], allowedMentions: { repliedUser: false } });
            } else {
                await message.reply({ content: 'No image found on Pixiv.', allowedMentions: { repliedUser: false } });
            }
        } catch (err) {
            console.error('Pixiv error:', err.message);
            await message.reply({ content: 'Error fetching Pixiv data.', allowedMentions: { repliedUser: false } });
        }
    }
};
