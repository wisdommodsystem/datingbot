const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: {
    name: 'bot',
    description: 'Get information about WisdomMatch bot'
  },

  async execute(message, args, client) {
    const embed = new EmbedBuilder()
      .setColor('#FF69B4')
      .setTitle('💫 WisdomMatch — A Dating Bot by Apollo')
      .setDescription('🚀 Created with love for Wisdom Circle — Now available for all servers!')
      .addFields(
        { name: '💬 Prefix', value: '`!`', inline: true },
        { name: '🌐 Invite and Use it Anywhere', value: 'Available for all servers', inline: true },
        { name: '🛠️ Developed by', value: 'Apollo', inline: true },
        { name: '📌 Support Server', value: 'https://discord.gg/uVR3jYYUu7', inline: true },
        { name: '🏛️ Wisdom Server', value: 'https://discord.gg/W5qJ4hgFxp', inline: true }
      )
      .addFields(
        { name: '💡 Features', value: 
          '💘 `!match` – Starts a random voice room matching between two users.\n' +
          '💌 `!nextlevel` – Unlock deep & spicy 18+ questions to get to know each other better.\n' +
          '🧠 `!lastchance` – Final step: do you want to continue or not?\n' +
          '🎭 `!newcouple @user1 @user2 NAME` – Creates a shared role for the couple.\n' +
          '📚 `!couples` – Shows all current couples saved.\n' +
          '📎 All couples are saved in a local .json file for memory and connection tracking.'
        }
      )
      .addFields(
        { name: '🗣️ Language', value: 'Bot replies and questions are written in Darija (Moroccan Arabic) for a unique cultural experience.' }
      )
      .addFields(
        { name: '✨ About', value: 'Whether you\'re looking for a spark, a deep connection, or just a fun voice interaction — WisdomMatch brings hearts closer in a playful, structured way. Try it now and see where the conversation takes you!' }
      )
      .setThumbnail('https://cdn.discordapp.com/emojis/1234567890.png')
      .setFooter({ text: 'WisdomMatch by Apollo • Dating Bot', iconURL: 'https://cdn.discordapp.com/emojis/1234567890.png' })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  }
}; 