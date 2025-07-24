const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const matchManager = require('../utils/matchManager');

module.exports = {
  data: {
    name: 'help',
    description: 'List all commands and steps to use the bot'
  },

  async execute(message, args, client) {
    // Get privileged users
    const privileged = matchManager.getAllPrivilegedUsers();
    const privilegedText = privileged.length > 0
      ? privileged.map(id => `<@${id}>`).join(' | ')
      : 'لا يوجد بعد.';

    const embed = new EmbedBuilder()
      .setColor('#8e44ad')
      .setTitle('━━━━━━━━━━━━━━━━━━━━━━━━━━\n✨ **WisdomMatching Help** ✨\n━━━━━━━━━━━━━━━━━━━━━━━━━━')
      .setDescription(
        '👋 **مرحباً بك في بوت WisdomMatching!**\n' +
        'هذا البوت صُمم خصيصاً لأحداث المواعدة الصوتية المغربية 🇲🇦\n\n' +
        '***Created by Apollo***\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━\n' +
        '📚 **الأوامر الرئيسية:**\n'
      )
      .addFields(
        { name: '1️⃣ !match', value: 'ابدأ ماتش جديد بين جوج أشخاص من voice channel (**Admins/Privileged**)', inline: false },
        { name: '2️⃣ !choice', value: 'صوتو واش عجبكم الطرف الآخر (**Admins/Privileged**)', inline: false },
        { name: '3️⃣ !nextlevel', value: 'أسئلة +18 ديال التعارف (**Admins/Privileged**)', inline: false },
        { name: '4️⃣ !lastchance', value: 'القرار النهائي: تكملو أو تسدوها (**Admins/Privileged**)', inline: false },
        { name: '5️⃣ !newcouple اسم_الرول', value: 'إنشاء رول مشترك للزوج (**Admins/Privileged**)', inline: false },
        { name: '6️⃣ !harawkan', value: 'إلغاء الماتش الحالي (**Admins/Privileged**)', inline: false },
        { name: '7️⃣ !checkstage', value: 'تحقق من مرحلة الزوج (**Admins/Privileged**)', inline: false },
        { name: '8️⃣ !debug <user_id> <stage>', value: 'تحديث مرحلة الزوج يدوياً (**Admins/Privileged**)', inline: false },
        { name: '9️⃣ !cleanup', value: 'تنظيف الأزواج المكتملة (**Admins/Privileged**)', inline: false },
        { name: '🔟 !leave', value: 'خروج البوت من voice channel (**Admins/Privileged**)', inline: false },
        { name: '📝 !couples', value: 'عرض جميع الأزواج الحاليين', inline: false },
        { name: '💔 !breakup @user', value: 'إنهاء علاقة زوج (متاح للجميع)', inline: false },
        { name: '🏓 !ping', value: 'معلومات عن البوت', inline: false },
        { name: '🆘 !help', value: 'عرض هذه الرسالة', inline: false }
      )
      .addFields(
        { name: '━━━━━━━━━━━━━━━━━━━━━━━', value: '🔄 **الخطوات الأساسية:**\n1. !match → 2. !choice → 3. !nextlevel → 4. !lastchance → 5. !newcouple\nاستخدم !harawkan أو !breakup لإلغاء الماتش في أي وقت.' }
      )
      .addFields(
        { name: '👑 **المستخدمين المميزين (Privileged):**', value: privilegedText, inline: false }
      )
      .setThumbnail('https://cdn.discordapp.com/emojis/1234567890.png')
      .setImage('https://media.discordapp.net/attachments/1122334455/banner_help.png')
      .setFooter({ text: 'WisdomMatching by apollo V1 • Matchmaking Event', iconURL: 'https://cdn.discordapp.com/emojis/1234567890.png' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('translate_help_en')
        .setLabel('Translate to English')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🇬🇧')
    );

    const sent = await message.channel.send({ embeds: [embed], components: [row] });

    // Create a collector for the button
    const filter = (i) => i.customId === 'translate_help_en';
    const collector = sent.createMessageComponentCollector({ filter, time: 120000, max: 1 });

    collector.on('collect', async (interaction) => {
      // English version of the embed
      const privilegedEn = privileged.length > 0
        ? privileged.map(id => `<@${id}>`).join(' | ')
        : 'None yet.';
      const enEmbed = new EmbedBuilder()
        .setColor('#2980b9')
        .setTitle('━━━━━━━━━━━━━━━━━━━━━━━━━━\n✨ **WisdomMatching Help** ✨\n━━━━━━━━━━━━━━━━━━━━━━━━━━')
        .setDescription(
          '👋 **Welcome to WisdomMatching Bot!**\nThis bot is designed for Moroccan voice dating events 🇲🇦\n\n' +
          '***Created by Apollo***\n\n' +
          '━━━━━━━━━━━━━━━━━━━━━━━\n' +
          '📚 **Main Commands:**\n'
        )
        .addFields(
          { name: '1️⃣ !match', value: 'Start a new match between two users in a voice channel (**Admins/Privileged**)', inline: false },
          { name: '2️⃣ !choice', value: 'Vote if you like the other person (**Admins/Privileged**)', inline: false },
          { name: '3️⃣ !nextlevel', value: '+18 Darija questions for couples (**Admins/Privileged**)', inline: false },
          { name: '4️⃣ !lastchance', value: 'Final decision: continue or end (**Admins/Privileged**)', inline: false },
          { name: '5️⃣ !newcouple role_name', value: 'Create a shared role for the couple (**Admins/Privileged**)', inline: false },
          { name: '6️⃣ !harawkan', value: 'Cancel the current match (**Admins/Privileged**)', inline: false },
          { name: '7️⃣ !checkstage', value: 'Check the couple stage (**Admins/Privileged**)', inline: false },
          { name: '8️⃣ !debug <user_id> <stage>', value: 'Manually update couple stage (**Admins/Privileged**)', inline: false },
          { name: '9️⃣ !cleanup', value: 'Clean up completed couples (**Admins/Privileged**)', inline: false },
          { name: '🔟 !leave', value: 'Bot leaves the voice channel (**Admins/Privileged**)', inline: false },
          { name: '📝 !couples', value: 'Show all current couples', inline: false },
          { name: '💔 !breakup @user', value: 'End a couple relationship (available to all)', inline: false },
          { name: '🏓 !ping', value: 'Bot info', inline: false },
          { name: '🆘 !help', value: 'Show this message', inline: false }
        )
        .addFields(
          { name: '━━━━━━━━━━━━━━━━━━━━━━━', value: '🔄 **Basic Steps:**\n1. !match → 2. !choice → 3. !nextlevel → 4. !lastchance → 5. !newcouple\nUse !harawkan or !breakup to cancel a match at any time.' }
        )
        .addFields(
          { name: '👑 **Privileged Users:**', value: privilegedEn, inline: false }
        )
        .setThumbnail('https://cdn.discordapp.com/emojis/1234567890.png')
        .setImage('https://media.discordapp.net/attachments/1122334455/banner_help.png')
        .setFooter({ text: 'WisdomMatching by apollo V1 • Matchmaking Event', iconURL: 'https://cdn.discordapp.com/emojis/1234567890.png' })
        .setTimestamp();
      try {
      await interaction.update({ embeds: [enEmbed], components: [] });
      } catch (error) {
        if (error.code === 10062) {
          // Interaction expired or already responded to, ignore or log if needed
          console.warn('Tried to update an expired or unknown interaction.');
        } else {
          console.error(error);
        }
      }
    });
  }
}; 