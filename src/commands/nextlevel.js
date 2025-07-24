const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const matchManager = require('../utils/matchManager');
const questions = require('../../questions/l7wafile.js');

module.exports = {
  data: {
    name: 'nextlevel',
    description: 'Send +18 Darija questions to couples'
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

    // Check if couple is at stage 2 (passed choice)
    if (couple.stage < 2) {
      return message.reply('❌ لازم تكملو مرحلة !choice الأول!');
    }

    // Get the other user
    const otherUserId = couple.user1 === message.author.id ? couple.user2 : couple.user1;
    const otherUser = await client.users.fetch(otherUserId);

    if (!otherUser) {
      return message.reply('❌ ما قدرتش نلقى الطرف الآخر!');
    }

    // Select 5 random questions
    const selectedQuestions = this.getRandomQuestions(questions, 5);

    // Create embed with questions
    const embed = new EmbedBuilder()
      .setColor('#E84393') // Vibrant pink for nextlevel
      .setTitle('━━━━━━━━━━━━━━━\n🔥 **أسئلة +18 ديال التعارف** 🔥\n━━━━━━━━━━━━━━━')
      .setDescription(`👫 **${message.author}** و **${otherUser}**\n\n**الأسئلة:**`)
      .addFields(
        selectedQuestions.map((question, index) => ({
          name: `❓ السؤال ${index + 1}`,
          value: `> ${question}`,
          inline: false
        }))
      )
      .addFields(
        { name: '📊 **عدد الأسئلة**', value: ` ${selectedQuestions.length}`, inline: true },
        { name: '🎭 **المرحلة**', value: '`مرحلة الأسئلة`', inline: true },
        { name: '⏰ **المدة**', value: '`غير محدودة`', inline: true }
      )
      .setThumbnail('https://cdn.discordapp.com/emojis/1234567890.png')
      .setImage('https://media.discordapp.net/attachments/1122334455/banner_questions.png')
      .setTimestamp()
      .setFooter({ text: 'WisdomMatching by apollo V1 • Matchmaking Event', iconURL: 'https://cdn.discordapp.com/emojis/1234567890.png' });

    const questionsMessage = await message.channel.send({ embeds: [embed] });

    // Update couple stage to 3
    const updateSuccess = matchManager.updateCoupleStage(couple.user1, couple.user2, 3);
    if (updateSuccess) {
      console.log(`✅ Successfully updated couple stage to 3 for ${couple.user1} and ${couple.user2}`);
    } else {
      console.log(`❌ Failed to update couple stage for ${couple.user1} and ${couple.user2}`);
    }

    // Send follow-up message
    setTimeout(async () => {
      const followUpEmbed = new EmbedBuilder()
        .setColor('#F7B731')
        .setTitle('━━━━━━━━━━━━━━━\n💌 **واش ناويين تكملو مع بعض؟** 💌\n━━━━━━━━━━━━━━━')
        .setDescription('استعمل !lastchance باش تقررو!')
        .addFields(
          { name: '⏰ **المدة**', value: '`غير محدودة`', inline: true },
          { name: '🎭 **المرحلة**', value: '`القرار النهائي`', inline: true }
        )
        .setThumbnail('https://cdn.discordapp.com/emojis/1234567890.png')
        .setTimestamp()
        .setFooter({ text: 'WisdomMatching by apollo V1', iconURL: 'https://cdn.discordapp.com/emojis/1234567890.png' });

      await message.channel.send({ embeds: [followUpEmbed] });
    }, 30000); // 30 seconds

    return questionsMessage;
  },

  getRandomQuestions(questionsArray, count) {
    const shuffled = [...questionsArray].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}; 