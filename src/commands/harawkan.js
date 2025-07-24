const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const matchManager = require('../utils/matchManager');

module.exports = {
  data: {
    name: 'harawkan',
    description: 'Cancel current match and try again'
  },

  async execute(message, args, client) {
    // Check admin permissions or privileged user
    const isPrivileged = matchManager.isPrivilegedUser(message.author.id);
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator) && !isPrivileged) {
      return message.reply('❌ ما عندكش صلاحية باش تستعمل هذا الأمر!');
    }

    // Check if user is in a couple
    const couple = matchManager.findCoupleByUser(message.author.id);
    
    if (!couple) {
      return message.reply('❌ ما كاينش couple! استعمل !match باش تبدأ ماتش جديد.');
    }

    // Get the other user
    const otherUserId = couple.user1 === message.author.id ? couple.user2 : couple.user1;
    const otherUser = await client.users.fetch(otherUserId);

    if (!otherUser) {
      return message.reply('❌ ما قدرتش نلقى الطرف الآخر!');
    }

    try {
      // Leave voice channel if bot is in one
      await this.leaveVoiceChannel(client, couple.user1, couple.user2);

      // Remove couple from database
      matchManager.removeCouple(couple.user1, couple.user2);

      // Clean up any stored match data
      if (client.currentMatches) {
        for (const [messageId, match] of client.currentMatches) {
          if ((match.user1 === couple.user1 && match.user2 === couple.user2) ||
              (match.user1 === couple.user2 && match.user2 === couple.user1)) {
            client.currentMatches.delete(messageId);
            break;
          }
        }
      }

      // Clean up choice messages
      if (client.choiceMessages) {
        for (const [messageId, choiceData] of client.choiceMessages) {
          if ((choiceData.user1 === couple.user1 && choiceData.user2 === couple.user2) ||
              (choiceData.user1 === couple.user2 && choiceData.user2 === couple.user1)) {
            client.choiceMessages.delete(messageId);
            break;
          }
        }
      }

      // Clean up lastchance messages
      if (client.lastchanceMessages) {
        for (const [messageId, lastchanceData] of client.lastchanceMessages) {
          if ((lastchanceData.user1 === couple.user1 && lastchanceData.user2 === couple.user2) ||
              (lastchanceData.user1 === couple.user2 && lastchanceData.user2 === couple.user1)) {
            client.lastchanceMessages.delete(messageId);
            break;
          }
        }
      }

      // Create success embed
      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('━━━━━━━━━━━━━━━\n🔄 **تم إلغاء الماتش** 🔄\n━━━━━━━━━━━━━━━')
        .setDescription(`👫 **${message.author}** و **${otherUser}**\n\nتم إلغاء الماتش بنجاح! يمكنكم استعمال !match باش تبدأو ماتش جديد.`)
        .addFields(
          { name: '📊 **المرحلة السابقة**', value: ` ${this.getStageText(couple.stage)}`, inline: true },
          { name: '💕 **الرول السابق**', value: ` ${couple.role || 'لا يوجد'}`, inline: true },
          { name: '⏰ **وقت الإلغاء**', value: ` ${new Date().toLocaleTimeString('ar-SA')}`, inline: true }
        )
        .setThumbnail('https://cdn.discordapp.com/emojis/1234567890.png')
        .setImage('https://media.discordapp.net/attachments/1122334455/banner_cancel.png')
        .setTimestamp()
        .setFooter({ text: 'WisdomMatching by apollo V1 • Matchmaking Event', iconURL: 'https://cdn.discordapp.com/emojis/1234567890.png' });

      await message.channel.send({ embeds: [embed] });

      console.log(`🔄 Match cancelled for users ${couple.user1} and ${couple.user2}`);

    } catch (error) {
      console.error('Error cancelling match:', error);
      return message.reply('❌ حدث خطأ أثناء إلغاء الماتش!');
    }
  },

  async leaveVoiceChannel(client, user1, user2) {
    try {
      // Find the voice channel for this couple
      let voiceChannelId = null;
      
      for (const [messageId, match] of client.currentMatches || []) {
        if (match.user1 === user1 && match.user2 === user2) {
          voiceChannelId = match.voiceChannel;
          break;
        }
      }

      if (voiceChannelId) {
        const connection = getVoiceConnection(client.guilds.cache.first().id);
        if (connection) {
          connection.destroy();
          console.log(`🤖 Bot left voice channel: ${voiceChannelId}`);
        }
      }
    } catch (error) {
      console.error('Error leaving voice channel:', error);
    }
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