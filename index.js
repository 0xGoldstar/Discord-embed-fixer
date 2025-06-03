require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Collections for commands and link fixers
client.commands = new Collection();
client.linkFixers = new Collection();

// ----------- Load utility commands -----------

const utilitiesPath = path.join(__dirname, 'utilities');
const utilityFiles = fs.existsSync(utilitiesPath) ? fs.readdirSync(utilitiesPath).filter(file => file.endsWith('.js')) : [];

console.log('----- Loading utility commands from /utilities -----');
if (utilityFiles.length === 0) {
  console.log('⚠️ No utility command files found in /utilities folder.');
} else {
  for (const file of utilityFiles) {
    const filePath = path.join(utilitiesPath, file);
    try {
      const command = require(filePath);
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`✅ Loaded utility command: ${command.data.name} (file: ${file})`);
      } else {
        console.log(`⚠️ Utility command at file "${file}" is missing "data" or "execute" property.`);
      }
    } catch (error) {
      console.error(`❌ Error loading utility command from file "${file}":`, error);
    }
  }
}
console.log('----- Finished loading utilities -----');

// ----------- Load linkFixer modules -----------

const linkFixerPath = path.join(__dirname, 'linkFixer');
const linkFixerFiles = fs.existsSync(linkFixerPath) ? fs.readdirSync(linkFixerPath).filter(file => file.endsWith('.js')) : [];

console.log('----- Loading linkFixer modules from /linkFixer -----');
if (linkFixerFiles.length === 0) {
  console.log('⚠️ No linkFixer module files found in /linkFixer folder.');
} else {
  for (const file of linkFixerFiles) {
    const filePath = path.join(linkFixerPath, file);
    try {
      const handlerFunction = require(filePath);
      if (typeof handlerFunction === 'function') {
        // Use filename (without .js) as key
        const moduleName = path.parse(file).name;
        client.linkFixers.set(moduleName, handlerFunction);
        console.log(`✅ Loaded linkFixer module: ${moduleName} (file: ${file})`);
      } else {
        console.log(`⚠️ LinkFixer module at file "${file}" does not export a function.`);
      }
    } catch (error) {
      console.error(`❌ Error loading linkFixer module from file "${file}":`, error);
    }
  }
}
console.log('----- Finished loading linkFixer modules -----');

// ----------- Register slash commands on ready -----------

client.once('ready', async () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  const commandsData = client.commands.map(command => command.data.toJSON());

  try {
    console.log(`🚀 Started refreshing ${commandsData.length} application (slash) commands.`);

    // Register global commands:
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commandsData }
    );

    console.log(`✅ Successfully reloaded ${commandsData.length} application (slash) commands.`);
  } catch (error) {
    console.error(error);
  }
});

// ----------- Interaction handler -----------

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
});

// ----------- Message listener to use linkFixer modules -----------

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  for (const [name, handler] of client.linkFixers) {
    try {
      await handler(message); // Pass the message to each link fixer function
    } catch (error) {
      console.error(`❌ Error in linkFixer module "${name}":`, error);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
