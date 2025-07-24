const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const matchManager = require('../utils/matchManager');

module.exports = {
  data: {
    name: 'lastchance',
    description: 'Final decision for couples to continue or end relationship'
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

    // Check if couple is at stage 3 (completed questions)
    if (couple.stage < 3) {
      return message.reply('❌ لازم تكملو مرحلة !nextlevel الأول!');
    }

    // Get the other user
    const otherUserId = couple.user1 === message.author.id ? couple.user2 : couple.user1;
    const otherUser = await client.users.fetch(otherUserId);

    if (!otherUser) {
      return message.reply('❌ ما قدرتش نلقى الطرف الآخر!');
    }

    // Create embed
    const embed = new EmbedBuilder()
      .setColor('#FF69B4')
      .setTitle('💌 واش ناويين تكملو مع بعض؟')
      .setDescription(`👫 ${message.author} و ${otherUser}\n\n**الخيارات:**\n❤️ = نكملو\n💔 = نسدوها هنا`)
      .addFields(
        { name: '⏰ المدة', value: 'غير محدودة', inline: true },
        { name: '🎭 المرحلة', value: 'القرار النهائي', inline: true },
        { name: '💬 القناة', value: message.channel.name, inline: true }
      )
      .setThumbnail('https://cdn.discordapp.com/emojis/1234567890.png')
      .setTimestamp()
      .setFooter({ text: 'WisdomMatching by apollo V1', iconURL: 'https://cdn.discordapp.com/emojis/1234567890.png' });

    const lastchanceMessage = await message.channel.send({ embeds: [embed] });

    // Add reactions
    await lastchanceMessage.react('❤️');
    await lastchanceMessage.react('💔');

    // Store lastchance data
    client.lastchanceMessages = client.lastchanceMessages || new Map();
    client.lastchanceMessages.set(lastchanceMessage.id, {
      user1: couple.user1,
      user2: couple.user2,
      user1Choice: null,
      user2Choice: null,
      channel: message.channel.id
    });

    return lastchanceMessage;
  },

  async handleReaction(reaction, user) {
    const message = reaction.message;
    const lastchanceData = message.client.lastchanceMessages?.get(message.id);
    
    if (!lastchanceData) return;

    const { user1, user2, user1Choice, user2Choice } = lastchanceData;
    const userId = user.id;

    // Determine which user reacted and what their choice was
    if (userId === user1) {
      lastchanceData.user1Choice = reaction.emoji.name === '❤️';
    } else if (userId === user2) {
      lastchanceData.user2Choice = reaction.emoji.name === '❤️';
    } else {
      return; // Not one of the matched users
    }

    // Check if both users have made their choice
    if (lastchanceData.user1Choice !== null && lastchanceData.user2Choice !== null) {
      await this.processLastchance(message, lastchanceData);
    }
  },

  async processLastchance(message, lastchanceData) {
    const { user1, user2, user1Choice, user2Choice } = lastchanceData;

    // Leave voice channel
    await this.leaveVoiceChannel(message.client, user1, user2);

    if (user1Choice && user2Choice) {
      // Both want to continue
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('💕 مبروك!')
        .setDescription('قررتما تكملو مع بعض! 🎉\nاستعمل !newcouple باش تخلقو رول مشترك!')
        .addFields(
          { name: '🎭 المرحلة', value: 'المرحلة النهائية', inline: true },
          { name: '⏰ وقت القرار', value: new Date().toLocaleTimeString('ar-SA'), inline: true },
          { name: '💕 النتيجة', value: 'نجح الماتش', inline: true }
        )
        .setThumbnail('https://cdn.discordapp.com/emojis/1234567890.png')
        .setTimestamp()
        .setFooter({ text: 'WisdomMatching by apollo V1', iconURL: 'https://cdn.discordapp.com/emojis/1234567890.png' });

      await message.channel.send({ embeds: [embed] });

      // Update couple stage to 4 (final stage)
      matchManager.updateCoupleStage(user1, user2, 4);
      
      // Remove the couple after completion to allow new matches
      // setTimeout(() => {
      //   matchManager.removeCouple(user1, user2);
      //   console.log(`✅ Completed couple removed: ${user1} and ${user2}`);
      // }, 5000); // Remove after 5 seconds
    } else {
      // One or both want to end
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('💔 انتهت العلاقة')
        .setDescription('قررتما تسدوها هنا...\nنتمناو الحظ فـ الماتش الجاي!')
        .addFields(
          { name: '🎭 المرحلة', value: 'انتهت العلاقة', inline: true },
          { name: '⏰ وقت القرار', value: new Date().toLocaleTimeString('ar-SA'), inline: true },
          { name: '💔 النتيجة', value: 'فشل الماتش', inline: true }
        )
        .setThumbnail('https://cdn.discordapp.com/emojis/1234567890.png')
        .setTimestamp()
        .setFooter({ text: 'WisdomMatching by apollo V1', iconURL: 'https://cdn.discordapp.com/emojis/1234567890.png' });

      await message.channel.send({ embeds: [embed] });

      // Remove couple from database
      matchManager.removeCouple(user1, user2);
    }

    // Clean up
    message.client.lastchanceMessages.delete(message.id);
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
  }
}; 