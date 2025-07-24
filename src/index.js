const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions
  ]
});

client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  }
}

// Event handler
client.once('ready', () => {
  console.log(`🤖 ${client.user.tag} is ready!`);
  console.log('🎯 WISDBOT - Voice Matchmaking Bot');
});

client.on('messageCreate', async message => {
  if (!message.content.startsWith('!') || message.author.bot) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);

  if (!command) return;

  try {
    await command.execute(message, args, client);
  } catch (error) {
    console.error(error);
    message.reply('❌ حدث خطأ أثناء تنفيذ الأمر!');
  }
});

// Handle reactions
client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;

  // Fetch the reaction if it's partial
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('Error fetching reaction:', error);
      return;
    }
  }

  // Handle choice reactions
  if (reaction.emoji.name === '👍' || reaction.emoji.name === '👎') {
    const choiceCommand = client.commands.get('choice');
    if (choiceCommand && choiceCommand.handleReaction) {
      await choiceCommand.handleReaction(reaction, user);
    }
  }

  // Handle lastchance reactions
  if (reaction.emoji.name === '❤️' || reaction.emoji.name === '💔') {
    const lastchanceCommand = client.commands.get('lastchance');
    if (lastchanceCommand && lastchanceCommand.handleReaction) {
      await lastchanceCommand.handleReaction(reaction, user);
    }
  }
});

client.login(process.env.DISCORD_TOKEN); 