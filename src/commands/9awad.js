const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const matchManager = require('../utils/matchManager');

module.exports = {
  data: {
    name: '9awad',
    description: 'Add a user to the privileged list (can use all commands)'
  },

  async execute(message, args, client) {
    // Admin only
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('❌ ما عندكش صلاحية باش تستعمل هذا الأمر!');
    }

    // Get user from mention or ID
    let userId;
    let userObj;
    if (message.mentions.users.size > 0) {
      userObj = message.mentions.users.first();
      userId = userObj.id;
    } else if (args.length > 0) {
      userId = args[0];
      try {
        userObj = await client.users.fetch(userId);
      } catch {
        userObj = null;
      }
    }
    if (!userId || !userObj) {
      return message.reply('❌ خاصك تدير @user أو ID صحيح. مثال: !9awad @user');
    }

    // Add to privileged list
    const added = matchManager.addPrivilegedUser(userId);
    const allPrivileged = matchManager.getAllPrivilegedUsers();

    const embed = new EmbedBuilder()
      .setColor(added ? '#00FF00' : '#FFD700')
      .setTitle('━━━━━━━━━━━━━━━\n👑 **إدارة المستخدمين المميزين** 👑\n━━━━━━━━━━━━━━━')
      .setDescription(added
        ? `✅ تم إضافة ${userObj} لقائمة المستخدمين المميزين!`
        : `⚠️ ${userObj} راه أصلاً فالقائمة.`)
      .addFields(
        { name: '👑 **المستخدمين المميزين حالياً:**', value: allPrivileged.length > 0 ? allPrivileged.map(id => `<@${id}>`).join(' | ') : 'لا يوجد بعد.' }
      )
      .setThumbnail('https://cdn.discordapp.com/emojis/1234567890.png')
      .setImage('https://media.discordapp.net/attachments/1122334455/banner_privileged.png')
      .setFooter({ text: 'WisdomMatching by apollo V1 • Privileged Users', iconURL: 'https://cdn.discordapp.com/emojis/1234567890.png' })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  }
}; 