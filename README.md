# Embed Bot Installation and Running Guide

A simple Discord bot that scans messages for supported links (like Pinterest or Pixiv), suppresses Discord's native embeds, and sends a custom embed preview instead. This guide covers how to install and run the bot, with optional instructions for using PM2 for process management.

---

## Demo

https://github.com/user-attachments/assets/8898a639-1ce1-4cd6-8826-7f4ed988bac0

---

## 📦 Requirements

- **Node.js** v16.9.0 or higher (required for Discord.js v14)
- **A Discord bot token** (obtained from the [Discord Developer Portal](https://discord.com/developers/applications))
- Optional: [PM2](https://pm2.keymetrics.io/) for process management
- A code editor (e.g., VS Code)
- A terminal or command-line interface
- Git (for cloning the repository)

---

## 📁 Project Setup

1. **Clone the repository**

   Clone the Embed Bot repository to your local machine and navigate to the project directory:

   ```bash
   git clone https://github.com/0xGoldstar/Discord-embed-fixer.git
   cd embed-bot
   ```

2. **Install dependencies**

   Install the required Node.js packages, including Discord.js, using npm:

   ```bash
   npm install
   ```

   This will install `discord.js` and any other dependencies listed in `package.json`.

3. **Configure the bot**

   Create a `.env` file in the project root to store your Discord bot token:

   ```bash
   touch .env
   ```

   Add the following line to the `.env` file, replacing `YOUR_BOT_TOKEN` with your actual bot token from the Discord Developer Portal:

   ```
   DISCORD_TOKEN=YOUR_BOT_TOKEN
   ```

   Ensure the `.env` file is listed in `.gitignore` to prevent exposing your token.

4. **Invite the bot to your server**

   - Go to the [Discord Developer Portal](https://discord.com/developers/applications).
   - Select your bot application, navigate to the "OAuth2" tab, and use the OAuth2 URL Generator.
   - Select the `bot` scope and the necessary permissions (e.g., `Send Messages`, `Embed Links`, `Read Messages/View Channels`).
   - Copy the generated URL, open it in a browser, and invite the bot to your server.

---

## 🚀 Running the Bot

### Option 1: Run Directly with Node.js

1. **Start the bot**

   In the project directory, run the main bot script (e.g., `index.js`):

   ```bash
   node index.js
   ```

   The bot should log in to Discord and start processing messages. You’ll see a message like `Logged in as Embed Bot#1234` in the terminal if successful.

2. **Stop the bot**

   To stop the bot, press `Ctrl + C` in the terminal.

### Option 2: Run with PM2 (Recommended for Production)

PM2 is a process manager that keeps your bot running in the background, restarts it on crashes, and provides monitoring tools.

1. **Install PM2 globally**

   If PM2 is not already installed, install it using npm:

   ```bash
   npm install -g pm2
   ```

2. **Start the bot with PM2**

   In the project directory, start the bot using PM2:

   ```bash
   pm2 start index.js --name "embed-bot"
   ```

   - The `--name "embed-bot"` option names the process for easier management.
   - PM2 will keep the bot running in the background and automatically restart it if it crashes.

3. **Monitor the bot**

   Check the status of your bot:

   ```bash
   pm2 status
   ```

   View logs in real-time:

   ```bash
   pm2 logs embed-bot
   ```

4. **Stop or restart the bot**

   To stop the bot:

   ```bash
   pm2 stop embed-bot
   ```

   To restart the bot (e.g., after making code changes):

   ```bash
   pm2 restart embed-bot
   ```

5. **Save PM2 configuration**

   To ensure PM2 restarts the bot automatically on system reboot:

   ```bash
   pm2 save
   ```

   Generate a startup script for PM2:

   ```bash
   pm2 startup
   ```

   Follow the output instructions to configure PM2 to run on system startup.
