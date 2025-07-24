const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const matchManager = require('../utils/matchManager');

module.exports = {
  data: {
    name: 'clear',
    description: 'Clear all couples from database (Admin only)'
  },

  async execute(message, args, client) {
    // Check admin permissions or privileged user
    const isPrivileged = matchManager.isPrivilegedUser(message.author.id);
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator) && !isPrivileged) {
      return message.reply('❌ ما عندكش صلاحية باش تستعمل هذا الأمر!');
    }

    try {
      // Clear all couples
      const matches = { couples: [] };
      matchManager.saveMatches(matches);

      // Clear current matches from memory
      if (client.currentMatches) {
        client.currentMatches.clear();
      }

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('━━━━━━━━━━━━━━━\n🗑️ **تم مسح جميع الأزواج** 🗑️\n━━━━━━━━━━━━━━━')
        .setDescription('تم مسح جميع الأزواج من قاعدة البيانات!')
        .setThumbnail('https://cdn.discordapp.com/emojis/1234567890.png')
        .setImage('https://media.discordapp.net/attachments/1122334455/banner_clear.png')
        .setTimestamp()
        .setFooter({ text: 'WisdomMatching by apollo V1 • Matchmaking Event', iconURL: 'https://cdn.discordapp.com/emojis/1234567890.png' });

      await message.channel.send({ embeds: [embed] });
      console.log('🗑️ All couples cleared from database');
    } catch (error) {
      console.error('Error clearing couples:', error);
      await message.reply('❌ حدث خطأ أثناء مسح الأزواج!');
    }
  }
}; 