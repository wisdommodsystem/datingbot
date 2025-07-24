const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const matchManager = require('../utils/matchManager');

module.exports = {
  data: {
    name: 'newcouple',
    description: 'Create a shared role for a couple'
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

    // Check if couple is at stage 4 (passed lastchance)
    if (couple.stage < 4) {
      return message.reply('❌ لازم تكملو مرحلة !lastchance الأول!');
    }

    // Check if role name is provided
    if (args.length < 1) {
      return message.reply('❌ لازم تدير اسم الرول! مثال: !newcouple @user1 @user2 اسم_الرول');
    }

    const roleName = args.join(' ');

    // Get the other user
    const otherUserId = couple.user1 === message.author.id ? couple.user2 : couple.user1;
    const otherUser = await client.users.fetch(otherUserId);

    if (!otherUser) {
      return message.reply('❌ ما قدرتش نلقى الطرف الآخر!');
    }

    try {
      // Create the role
      const role = await message.guild.roles.create({
        name: roleName,
        color: '#FF69B4',
        reason: `Couple role for ${message.author.username} and ${otherUser.username}`,
        permissions: []
      });

      // Assign role to both users
      await message.member.roles.add(role);
      await message.guild.members.fetch(otherUserId).then(member => {
        member.roles.add(role);
      });

      // Update couple with role name
      matchManager.updateCoupleRole(couple.user1, couple.user2, roleName);

      // Create success embed
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('━━━━━━━━━━━━━━━\n💕 **تم إنشاء الرول المشترك!** 💕\n━━━━━━━━━━━━━━━')
        .setDescription(`👫 **${message.author}** و **${otherUser}**\n\n**الرول:** \`${roleName}\`\n\nتم إعطاء الرول للطرفين! 🎉`)
        .addFields(
          { name: '🎭 **المرحلة**', value: '`المرحلة النهائية`', inline: true },
          { name: '💕 **الرول**', value: ` ${roleName}`, inline: true },
          { name: '👥 **الأعضاء**', value: '`2 أعضاء`', inline: true }
        )
        .setThumbnail('https://cdn.discordapp.com/emojis/1234567890.png')
        .setImage('https://media.discordapp.net/attachments/1122334455/banner_newcouple.png')
        .setTimestamp()
        .setFooter({ text: 'WisdomMatching by apollo V1 • Matchmaking Event', iconURL: 'https://cdn.discordapp.com/emojis/1234567890.png' });

      await message.channel.send({ embeds: [embed] });

    } catch (error) {
      console.error('Error creating role:', error);
      return message.reply('❌ حدث خطأ أثناء إنشاء الرول! تأكد من أن البوت عنده صلاحيات كافية.');
    }
  }
}; 