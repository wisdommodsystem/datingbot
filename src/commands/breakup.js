const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const matchManager = require('../utils/matchManager');

module.exports = {
  data: {
    name: 'breakup',
    description: 'End a couple relationship'
  },

  async execute(message, args, client) {
    // Check permissions
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return message.reply('❌ ما عندكش صلاحية باش تسد الأزواج!');
    }

    // Check if user is provided
    if (args.length < 1) {
      return message.reply('❌ لازم تدير @user باش تسد الزوج! مثال: !breakup @user');
    }

    // Get mentioned user
    const mentionedUser = message.mentions.users.first();
    if (!mentionedUser) {
      return message.reply('❌ ما قدرتش نلقى المستخدم! تأكد من أنك ذكرت المستخدم بشكل صحيح.');
    }

    // Find couple with mentioned user
    const couple = matchManager.findCoupleByUser(mentionedUser.id);
    
    if (!couple) {
      return message.reply('❌ ما كاينش زوج مع هذا المستخدم!');
    }

    // Get the other user
    const otherUserId = couple.user1 === mentionedUser.id ? couple.user2 : couple.user1;
    const otherUser = await client.users.fetch(otherUserId);

    if (!otherUser) {
      return message.reply('❌ ما قدرتش نلقى الطرف الآخر!');
    }

    try {
      // Remove role if exists
      if (couple.role) {
        const role = message.guild.roles.cache.find(r => r.name === couple.role);
        if (role) {
          const member1 = await message.guild.members.fetch(mentionedUser.id);
          const member2 = await message.guild.members.fetch(otherUserId);
          
          if (member1.roles.cache.has(role.id)) {
            await member1.roles.remove(role);
          }
          if (member2.roles.cache.has(role.id)) {
            await member2.roles.remove(role);
          }
        }
      }

      // Remove couple from database
      matchManager.removeCouple(couple.user1, couple.user2);

      // Create success embed
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('━━━━━━━━━━━━━━━\n💔 **تم إنهاء الزوج** 💔\n━━━━━━━━━━━━━━━')
        .setDescription(`👫 **${mentionedUser}** و **${otherUser}**\n\nتم إنهاء العلاقة وحذف الرول المشترك!`)
        .setThumbnail('https://cdn.discordapp.com/emojis/1234567890.png')
        .setImage('https://media.discordapp.net/attachments/1122334455/banner_breakup.png')
        .setTimestamp()
        .setFooter({ text: 'WisdomMatching by apollo V1 • Matchmaking Event', iconURL: 'https://cdn.discordapp.com/emojis/1234567890.png' });

      await message.channel.send({ embeds: [embed] });

    } catch (error) {
      console.error('Error breaking up couple:', error);
      return message.reply('❌ حدث خطأ أثناء إنهاء الزوج!');
    }
  }
}; 