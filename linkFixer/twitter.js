module.exports = async function handleTwitter(message) {
    const content = message.content;
    if (!/(https?:\/\/(?:twitter\.com|x\.com)\b)/i.test(content)) return;

    // Wait for embed to show up then suppress
    const timeout = 10000;
    const pollInterval = 250;
    const start = Date.now();

    let suppressed = false;
    while (!suppressed && Date.now() - start < timeout) {
        try {
            const fetched = await message.channel.messages.fetch(message.id);
            const embedCount = fetched.embeds.length;
            console.log(`[${Date.now()}] Twitter/X embed count: ${embedCount}`);

            if (embedCount > 0) {
                await fetched.suppressEmbeds(true);
                console.log("✅ Twitter/X embed suppressed.");
                suppressed = true;
                break;
            }
        } catch (err) {
            console.error("❌ Twitter/X fetch/suppress error:", err.message);
        }
        await new Promise(res => setTimeout(res, pollInterval));
    }

    let modified = content;
    if (content.includes('twitter.com')) {
        modified = modified.replace(
            /https?:\/\/twitter\.com[^\s]+/gi,
            m => `[⠀](${m.replace(/https?:\/\/twitter\.com/i, 'https://fxtwitter.com')})`
        );
    } else if (content.includes('x.com')) {
        modified = modified.replace(
            /https?:\/\/x\.com[^\s]+/gi,
            m => `[⠀](${m.replace(/https?:\/\/x\.com\b/i, 'https://fixupx.com')})`
        );
    }

    try {
        await message.reply({
            content: modified,
            allowedMentions: { repliedUser: false }
        });
    } catch (err) {
        console.error('Twitter/X reply error:', err.message);
    }
};
