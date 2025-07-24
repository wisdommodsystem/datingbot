const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
  data: {
    name: 'leave',
    description: 'Make bot leave voice channel (Admin only)'
  },

  async execute(message, args, client) {
    // Check permissions or privileged user
    const matchManager = require('../utils/matchManager');
    const isPrivileged = matchManager.isPrivilegedUser(message.author.id);
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels) && !isPrivileged) {
      return message.reply('❌ ما عندكش صلاحية باش تستعمل هذا الأمر!');
    }

    try {
      const connection = getVoiceConnection(message.guild.id);
      
      if (connection) {
        connection.destroy();
        
        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('👋 تم الخروج من Voice Channel')
          .setDescription('تم إخراج البوت من voice channel بنجاح!')
          .addFields(
            { name: '🎵 القناة', value: 'Voice Channel', inline: true },
            { name: '⏰ وقت الخروج', value: new Date().toLocaleTimeString('ar-SA'), inline: true },
            { name: '🎭 الحالة', value: 'غير متصل', inline: true }
          )
          .setThumbnail('https://cdn.discordapp.com/emojis/1234567890.png')
          .setTimestamp()
          .setFooter({ text: 'WisdomMatching by apollo V1', iconURL: 'https://cdn.discordapp.com/emojis/1234567890.png' });

        await message.channel.send({ embeds: [embed] });
        console.log(`🤖 Bot left voice channel manually`);
      } else {
        await message.reply('❌ البوت ما كانش فـ voice channel!');
      }
    } catch (error) {
      console.error('Error leaving voice channel:', error);
      await message.reply('❌ حدث خطأ أثناء الخروج من voice channel!');
    }
  }
}; 