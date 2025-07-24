const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const matchManager = require('../utils/matchManager');

module.exports = {
  data: {
    name: 'choice',
    description: 'Let users choose if they like each other'
  },

  async execute(message, args, client) {
    // Check admin permissions or privileged user
    const isPrivileged = require('../utils/matchManager').isPrivilegedUser(message.author.id);
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator) && !isPrivileged) {
      return message.reply('❌ ما عندكش صلاحية باش تستعمل هذا الأمر!');
    }

    let user1Id, user2Id;

    // If args provided, use them, otherwise get the latest couple for the user from the database
    if (args.length >= 2) {
      user1Id = args[0];
      user2Id = args[1];
    } else {
      // Get the latest couple for the user from the database
      const couple = require('../utils/matchManager').findCoupleByUser(message.author.id);
      if (!couple) {
        return message.reply('❌ ما كاينش ماتش حالي! استعمل !match باش تبدأ ماتش جديد.');
      }
      user1Id = couple.user1;
      user2Id = couple.user2;
    }

    // Get user objects
    const user1 = await client.users.fetch(user1Id);
    const user2 = await client.users.fetch(user2Id);

    if (!user1 || !user2) {
      return message.reply('❌ ما قدرتش نلقى المستخدمين!');
    }

    // Create embed
    const embed = new EmbedBuilder()
      .setColor('#F7B731')
      .setTitle('━━━━━━━━━━━━━━━\n🤔 **واش عجبك الطرف الآخر؟** 🤔\n━━━━━━━━━━━━━━━')
      .setDescription('صوت بلا ما تفكر بزاف 😏\n\n**اختار:** 👍 = نعم | 👎 = لا')
      .addFields(
        { name: '👤 **المستخدم 1**', value: user1.toString(), inline: true },
        { name: '👤 **المستخدم 2**', value: user2.toString(), inline: true },
        { name: '⏰ **المدة**', value: '`غير محدودة`', inline: true },
        { name: '🎭 **المرحلة**', value: '`مرحلة الاختيار`', inline: true }
      )
      .setThumbnail('https://cdn.discordapp.com/emojis/1234567890.png')
      .setImage('https://media.discordapp.net/attachments/1122334455/banner_choice.png')
      .setTimestamp()
      .setFooter({ text: 'WisdomMatching by apollo V1 • Matchmaking Event', iconURL: 'https://cdn.discordapp.com/emojis/1234567890.png' });

    const choiceMessage = await message.channel.send({ embeds: [embed] });

    // Add reactions
    await choiceMessage.react('👍');
    await choiceMessage.react('👎');

    // Store choice data
    client.choiceMessages = client.choiceMessages || new Map();
    client.choiceMessages.set(choiceMessage.id, {
      user1: user1Id,
      user2: user2Id,
      user1Choice: null,
      user2Choice: null,
      channel: message.channel.id
    });

    return choiceMessage;
  },

  findCurrentMatch(channelId, client) {
    if (!client.currentMatches) return null;
    
    for (const [messageId, match] of client.currentMatches) {
      if (match.channel === channelId) {
        return match;
      }
    }
    return null;
  },

  async handleReaction(reaction, user) {
    const message = reaction.message;
    const choiceData = message.client.choiceMessages?.get(message.id);
    
    if (!choiceData) return;

    const { user1, user2, user1Choice, user2Choice } = choiceData;
    const userId = user.id;

    // Determine which user reacted and what their choice was
    let newChoice = null;
    if (userId === user1) {
      choiceData.user1Choice = reaction.emoji.name === '👍';
      newChoice = choiceData.user1Choice;
    } else if (userId === user2) {
      choiceData.user2Choice = reaction.emoji.name === '👍';
      newChoice = choiceData.user2Choice;
    } else {
      return; // Not one of the matched users
    }

    // Check if both users have made their choice
    if (choiceData.user1Choice !== null && choiceData.user2Choice !== null) {
      await this.processChoices(message, choiceData);
    }
  },

  async processChoices(message, choiceData) {
    const { user1, user2, user1Choice, user2Choice } = choiceData;

    if (user1Choice && user2Choice) {
      // Both like each other
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('━━━━━━━━━━━━━━━\n💕 **توافق!** 💕\n━━━━━━━━━━━━━━━')
        .setDescription('كل واحد عجبو الطرف الآخر! 🎉\nيمكنكم استعمال !nextlevel باش تكملو!')
        .setThumbnail('https://cdn.discordapp.com/emojis/1234567890.png')
        .setTimestamp()
        .setFooter({ text: 'WisdomMatching by apollo V1', iconURL: 'https://cdn.discordapp.com/emojis/1234567890.png' });

      await message.channel.send({ embeds: [embed] });

      // Update couple stage
      matchManager.updateCoupleStage(user1, user2, 2);
    } else {
      // One or both don't like each other
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('━━━━━━━━━━━━━━━\n💔 **للأسف، ما كاينش توافق...** 💔\n━━━━━━━━━━━━━━━')
        .setDescription('نتمناو الحظ فـ الماتش الجاي!')
        .setThumbnail('https://cdn.discordapp.com/emojis/1234567890.png')
        .setTimestamp()
        .setFooter({ text: 'WisdomMatching by apollo V1', iconURL: 'https://cdn.discordapp.com/emojis/1234567890.png' });

      await message.channel.send({ embeds: [embed] });

      // Remove couple from database
      matchManager.removeCouple(user1, user2);

      // Remove from currentMatches and choiceMessages
      if (message.client.currentMatches) {
        for (const [msgId, match] of message.client.currentMatches) {
          if ((match.user1 === user1 && match.user2 === user2) || (match.user1 === user2 && match.user2 === user1)) {
            message.client.currentMatches.delete(msgId);
          }
        }
      }
      if (message.client.choiceMessages) {
        for (const [msgId, choice] of message.client.choiceMessages) {
          if ((choice.user1 === user1 && choice.user2 === user2) || (choice.user1 === user2 && choice.user2 === user1)) {
            message.client.choiceMessages.delete(msgId);
          }
        }
      }

      // Leave voice channel since match failed
      await this.leaveVoiceChannel(message.client, user1, user2);
    }

    // Clean up
    message.client.choiceMessages.delete(message.id);
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