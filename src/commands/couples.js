const { EmbedBuilder } = require('discord.js');
const matchManager = require('../utils/matchManager');

module.exports = {
  data: {
    name: 'couples',
    description: 'List all couples from the database'
  },

  async execute(message, args, client) {
    const couples = matchManager.getAllCouples();
    
    if (couples.length === 0) {
      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('━━━━━━━━━━━━━━━\n💑 **قائمة الأزواج** 💑\n━━━━━━━━━━━━━━━')
        .setDescription('ما كاينش أزواج حالياً!')
        .addFields(
          { name: '📊 **الإحصائيات**', value: '`0 أزواج`', inline: true },
          { name: '🎭 **الحالة**', value: '`فارغ`', inline: true }
        )
        .setThumbnail('https://cdn.discordapp.com/emojis/1234567890.png')
        .setImage('https://media.discordapp.net/attachments/1122334455/banner_couples.png')
        .setTimestamp()
        .setFooter({ text: 'WisdomMatching by apollo V1 • Matchmaking Event', iconURL: 'https://cdn.discordapp.com/emojis/1234567890.png' });

      return message.channel.send({ embeds: [embed] });
    }

    // Create embed with couples list
    const embed = new EmbedBuilder()
      .setColor('#FF69B4')
      .setTitle('━━━━━━━━━━━━━━━\n💑 **قائمة الأزواج** 💑\n━━━━━━━━━━━━━━━')
      .setDescription(`**عدد الأزواج:** \`${couples.length}\``)
      .addFields(
        { name: '📊 **الإحصائيات**', value: ` ${couples.length} أزواج`, inline: true },
        { name: '🎭 **الحالة**', value: '`نشط`', inline: true },
        { name: '⏰ **آخر تحديث**', value: ` ${new Date().toLocaleTimeString('ar-SA')}`, inline: true }
      )
      .setThumbnail('https://cdn.discordapp.com/emojis/1234567890.png')
      .setImage('https://media.discordapp.net/attachments/1122334455/banner_couples.png')
      .setTimestamp()
      .setFooter({ text: 'WisdomMatching by apollo V1 • Matchmaking Event', iconURL: 'https://cdn.discordapp.com/emojis/1234567890.png' });

    // Add couples to embed
    for (let i = 0; i < couples.length; i++) {
      const couple = couples[i];
      
      try {
        const user1 = await client.users.fetch(couple.user1);
        const user2 = await client.users.fetch(couple.user2);
        
        const matchDate = new Date(couple.matched_at).toLocaleDateString('ar-SA');
        const stageText = this.getStageText(couple.stage);
        const roleText = couple.role ? `💕 ${couple.role}` : 'لا يوجد رول';
        
        embed.addFields({
          name: `💑 زوج ${i + 1}`,
          value: `👤 ${user1} ❤️ ${user2}\nالمرحلة: **${stageText}** | الرول: **${roleText}**\nالتاريخ: \`${matchDate}\``,
          inline: false
        });
      } catch (error) {
        console.error(`Error fetching user for couple ${i}:`, error);
        embed.addFields({
          name: `💑 زوج ${i + 1}`,
          value: `مستخدم غير متاح ❤️ مستخدم غير متاح\nالمرحلة: **${this.getStageText(couple.stage)}** | الرول: **${couple.role || 'لا يوجد رول'}**\nالتاريخ: \`${new Date(couple.matched_at).toLocaleDateString('ar-SA')}\``,
          inline: false
        });
      }
    }

    return message.channel.send({ embeds: [embed] });
  },

  getStageText(stage) {
    switch (stage) {
      case 1:
        return '1 - تم المطابقة';
      case 2:
        return '2 - تم الاختيار';
      case 3:
        return '3 - تم الأسئلة';
      case 4:
        return '4 - تم القرار النهائي';
      default:
        return stage;
    }
  }
}; 