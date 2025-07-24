const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const matchManager = require('../utils/matchManager');

module.exports = {
  data: {
    name: 'debug',
    description: 'Debug command for testing (Admin only)'
  },

  async execute(message, args, client) {
    // Check admin permissions or privileged user
    const isPrivileged = matchManager.isPrivilegedUser(message.author.id);
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator) && !isPrivileged) {
      return message.reply('❌ ما عندكش صلاحية باش تستعمل هذا الأمر!');
    }

    if (args.length < 2) {
      return message.reply('❌ استعمال: !debug <user_id> <stage>');
    }

    const userId = args[0];
    const stage = parseInt(args[1]);

    if (isNaN(stage) || stage < 1 || stage > 4) {
      return message.reply('❌ المرحلة يجب أن تكون بين 1 و 4!');
    }

    // Find couple with user
    const couple = matchManager.findCoupleByUser(userId);
    
    if (!couple) {
      return message.reply('❌ ما كاينش زوج مع هذا المستخدم!');
    }

    // Update stage
    const success = matchManager.updateCoupleStage(couple.user1, couple.user2, stage);

    if (success) {
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('━━━━━━━━━━━━━━━\n✅ **تم تحديث المرحلة** ✅\n━━━━━━━━━━━━━━━')
        .setDescription(`تم تحديث المرحلة إلى: **${stage}**`)
        .addFields(
          { name: '👤 **المستخدم 1**', value: `<@${couple.user1}>`, inline: true },
          { name: '👤 **المستخدم 2**', value: `<@${couple.user2}>`, inline: true },
          { name: '📈 **المرحلة الجديدة**', value: `**${stage}**`, inline: true },
          { name: '⏰ **وقت التحديث**', value: ` ${new Date().toLocaleTimeString('ar-SA')}`, inline: true }
        )
        .setThumbnail('https://cdn.discordapp.com/emojis/1234567890.png')
        .setImage('https://media.discordapp.net/attachments/1122334455/banner_debug.png')
        .setTimestamp()
        .setFooter({ text: 'WisdomMatching by apollo V1 • Matchmaking Event', iconURL: 'https://cdn.discordapp.com/emojis/1234567890.png' });

      await message.channel.send({ embeds: [embed] });
    } else {
      await message.reply('❌ حدث خطأ أثناء تحديث المرحلة!');
    }
  }
}; 