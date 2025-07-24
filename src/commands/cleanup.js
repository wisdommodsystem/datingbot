const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const matchManager = require('../utils/matchManager');

module.exports = {
  data: {
    name: 'cleanup',
    description: 'Clean up completed couples and allow fresh matches (Admin only)'
  },

  async execute(message, args, client) {
    // Check admin permissions or privileged user
    const isPrivileged = matchManager.isPrivilegedUser(message.author.id);
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator) && !isPrivileged) {
      return message.reply('❌ ما عندكش صلاحية باش تستعمل هذا الأمر!');
    }

    try {
      const matches = matchManager.loadMatches();
      const totalCouples = matches.couples.length;
      let removedCount = 0;

      // Remove completed couples (stage 4)
      matches.couples = matches.couples.filter(couple => {
        if (couple.stage >= 4) {
          removedCount++;
          console.log(`🗑️ Removed completed couple: ${couple.user1} and ${couple.user2}`);
          return false; // Remove this couple
        }
        return true; // Keep this couple
      });

      // Save the cleaned data
      matchManager.saveMatches(matches);

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('━━━━━━━━━━━━━━━\n🧹 **تم تنظيف الأزواج المكتملة** 🧹\n━━━━━━━━━━━━━━━')
        .setDescription(`تم إزالة **${removedCount}** زوج مكتمل من أصل **${totalCouples}** زوج`)
        .addFields(
          { name: '📊 **الأزواج المتبقية**', value: ` ${totalCouples - removedCount}`, inline: true },
          { name: '🗑️ **الأزواج المحذوفة**', value: ` ${removedCount}`, inline: true },
          { name: '⏰ **وقت التنظيف**', value: ` ${new Date().toLocaleTimeString('ar-SA')}`, inline: true }
        )
        .setThumbnail('https://cdn.discordapp.com/emojis/1234567890.png')
        .setImage('https://media.discordapp.net/attachments/1122334455/banner_cleanup.png')
        .setTimestamp()
        .setFooter({ text: 'WisdomMatching by apollo V1 • Matchmaking Event', iconURL: 'https://cdn.discordapp.com/emojis/1234567890.png' });

      await message.channel.send({ embeds: [embed] });
      console.log(`🧹 Cleanup completed: ${removedCount} couples removed`);

    } catch (error) {
      console.error('Error during cleanup:', error);
      await message.reply('❌ حدث خطأ أثناء التنظيف!');
    }
  }
}; 