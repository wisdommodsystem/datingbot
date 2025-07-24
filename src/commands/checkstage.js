const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const matchManager = require('../utils/matchManager');

module.exports = {
  data: {
    name: 'checkstage',
    description: 'Check the current stage of a couple'
  },

  async execute(message, args, client) {
    // Check admin permissions or privileged user
    const isPrivileged = matchManager.isPrivilegedUser(message.author.id);
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator) && !isPrivileged) {
      return message.reply('❌ ما عندكش صلاحية باش تستعمل هذا الأمر!');
    }

    let userId;

    if (args.length > 0) {
      // If user ID provided as argument
      userId = args[0];
    } else {
      // Use the message author
      userId = message.author.id;
    }

    // Find couple with user
    const couple = matchManager.findCoupleByUser(userId);
    
    if (!couple) {
      return message.reply('❌ ما كاينش زوج مع هذا المستخدم!');
    }

    const stageText = this.getStageText(couple.stage);
    const user1 = await client.users.fetch(couple.user1);
    const user2 = await client.users.fetch(couple.user2);

    const embed = new EmbedBuilder()
      .setColor('#00BFFF')
      .setTitle('━━━━━━━━━━━━━━━\n📊 **معلومات الزوج** 📊\n━━━━━━━━━━━━━━━')
      .addFields(
        { name: '👤 **المستخدم 1**', value: user1 ? user1.toString() : 'غير متاح', inline: true },
        { name: '👤 **المستخدم 2**', value: user2 ? user2.toString() : 'غير متاح', inline: true },
        { name: '📈 **المرحلة الحالية**', value: `**${stageText}**`, inline: true },
        { name: '💕 **الرول المشترك**', value: couple.role || 'لا يوجد', inline: true },
        { name: '📅 **تاريخ المطابقة**', value: ` ${new Date(couple.matched_at).toLocaleDateString('ar-SA')}`, inline: true },
        { name: '⏰ **وقت التحقق**', value: ` ${new Date().toLocaleTimeString('ar-SA')}`, inline: true }
      )
      .setThumbnail('https://cdn.discordapp.com/emojis/1234567890.png')
      .setImage('https://media.discordapp.net/attachments/1122334455/banner_checkstage.png')
      .setTimestamp()
      .setFooter({ text: 'WisdomMatching by apollo V1 • Matchmaking Event', iconURL: 'https://cdn.discordapp.com/emojis/1234567890.png' });

    await message.channel.send({ embeds: [embed] });
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
        return stage.toString();
    }
  }
}; 