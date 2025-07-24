const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: {
    name: 'ping',
    description: 'Get bot information and purpose'
  },

  async execute(message, args, client) {
    const embed = new EmbedBuilder()
      .setColor('#00BFFF')
      .setTitle('━━━━━━━━━━━━━━━\n🤖 **WisdomMatching Bot Info** 🤖\n━━━━━━━━━━━━━━━')
      .setDescription('Created by **Apollo**\n\n> **For: Dating events to make our members get partners**')
      .addFields(
        { name: '🕒 **Uptime**', value: ` ${Math.floor(process.uptime() / 60)} min`, inline: true },
        { name: '💡 **Version**', value: '`V1`', inline: true },
        { name: '👤 **Owner**', value: '`Apollo`', inline: true },
        { name: '📅 **Date**', value: ` ${new Date().toLocaleDateString('ar-SA')}`, inline: true },
        { name: '🏓 **Ping**', value: ` ${client.ws.ping} ms`, inline: true }
      )
      .setThumbnail('https://cdn.discordapp.com/emojis/1234567890.png')
      .setImage('https://media.discordapp.net/attachments/1122334455/banner_ping.png')
      .setFooter({ text: 'WisdomMatching by apollo V1 • Matchmaking Event', iconURL: 'https://cdn.discordapp.com/emojis/1234567890.png' })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  }
}; 