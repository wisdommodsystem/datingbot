const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const matchManager = require('../utils/matchManager');

module.exports = {
  data: {
    name: 'match',
    description: 'Randomly match two users from voice channel'
  },

  async execute(message, args, client) {
    // Check admin permissions or privileged user
    const isPrivileged = matchManager.isPrivilegedUser(message.author.id);
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator) && !isPrivileged) {
      return message.reply('❌ ما عندكش صلاحية باش تستعمل هذا الأمر!');
    }

    // Check if user is in a voice channel
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.reply('❌ لازم تكون فـ voice channel باش تستعمل هذا الأمر!');
    }

    // Get all members in the voice channel (excluding bots)
    const members = voiceChannel.members.filter(member => !member.user.bot);
    
    if (members.size < 2) {
      return message.reply('❌ لازم يكونو على الأقل جوج أشخاص فـ voice channel!');
    }

    // Convert to array and shuffle
    const memberArray = Array.from(members.values());
    const shuffled = memberArray.sort(() => 0.5 - Math.random());
    
    // Select first two users
    const user1 = shuffled[0];
    const user2 = shuffled[1];

    // Check if users are already in an active couple (stage 1-3)
    const existingCouple1 = matchManager.findCoupleByUser(user1.id);
    const existingCouple2 = matchManager.findCoupleByUser(user2.id);

    // Check if either user is in an active couple
    if (existingCouple1 && existingCouple1.stage < 4) {
      return message.reply(`❌ ${user1} موجود فـ couple نشط! استعمل !harawkan باش تسد الزوج الأول.`);
    }
    if (existingCouple2 && existingCouple2.stage < 4) {
      return message.reply(`❌ ${user2} موجود فـ couple نشط! استعمل !harawkan باش تسد الزوج الأول.`);
    }

    // Remove any old completed couples for these users
    if (existingCouple1 && existingCouple1.stage >= 4) {
      console.log(`🗑️ Removing completed couple for ${user1.id}`);
      matchManager.removeCouple(existingCouple1.user1, existingCouple1.user2);
    }
    if (existingCouple2 && existingCouple2.stage >= 4) {
      console.log(`🗑️ Removing completed couple for ${user2.id}`);
      matchManager.removeCouple(existingCouple2.user1, existingCouple2.user2);
    }

    // Create embed
    const embed = new EmbedBuilder()
      .setColor('#F7B731') // Gold for match
      .setTitle('━━━━━━━━━━━━━━━\n🎯 **ماتش جديد!** 🎯\n━━━━━━━━━━━━━━━')
      .setDescription(`👫 **${user1}** و **${user2}**

> عندكم **جوج دقايق** باش تسولو بعضكم أسئلة ديال تعارف 🌹\nاستغلوهم مزيان 😉`)
      .addFields(
        { name: '⏰ **المدة**', value: '`2 دقائق`', inline: true },
        { name: '🎭 **المرحلة**', value: '`التعارف الأولي`', inline: true },
        { name: '💬 **القناة**', value: `#${voiceChannel.name}`, inline: true }
      )
      .setThumbnail('https://cdn.discordapp.com/emojis/1234567890.png')
      .setImage('https://media.discordapp.net/attachments/1122334455/banner_match.png')
      .setTimestamp()
      .setFooter({ text: 'WisdomMatching by apollo V1 • Matchmaking Event', iconURL: 'https://cdn.discordapp.com/emojis/1234567890.png' });

    const matchMessage = await message.channel.send({ embeds: [embed] });

    // Add couple to database
    matchManager.addCouple(user1.id, user2.id, 1);

    // Store match data for later use
    client.currentMatches = client.currentMatches || new Map();
    client.currentMatches.set(matchMessage.id, {
      user1: user1.id,
      user2: user2.id,
      channel: message.channel.id,
      voiceChannel: voiceChannel.id,
      timestamp: Date.now()
    });

    // Try to join voice channel (optional)
    try {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false,
      });

      // Store voice connection for later use
      client.voiceConnections = client.voiceConnections || new Map();
      client.voiceConnections.set(voiceChannel.id, connection);

      console.log(`🤖 Bot joined voice channel: ${voiceChannel.name}`);
      
      // Send confirmation message
      const voiceEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('━━━━━━━━━━━━━━━\n🎵 **تم الانضمام إلى Voice Channel** 🎵\n━━━━━━━━━━━━━━━')
        .setDescription(`✅ تم انضمام البوت إلى **${voiceChannel.name}** بنجاح!`)
        .setThumbnail('https://cdn.discordapp.com/emojis/1234567890.png')
        .setTimestamp()
        .setFooter({ text: 'WisdomMatching by apollo V1', iconURL: 'https://cdn.discordapp.com/emojis/1234567890.png' });
      
      await message.channel.send({ embeds: [voiceEmbed] });
      
    } catch (error) {
      console.error('Error joining voice channel:', error);
      // Continue with match even if voice join fails
      console.log('⚠️ Continuing match without voice channel');
      
      // Send warning message
      const warningEmbed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('━━━━━━━━━━━━━━━\n⚠️ **تحذير** ⚠️\n━━━━━━━━━━━━━━━')
        .setDescription('❗ البوت ما قدرش يدخل voice channel، لكن الماتش راح يكمل!')
        .setThumbnail('https://cdn.discordapp.com/emojis/1234567890.png')
        .setTimestamp()
        .setFooter({ text: 'WisdomMatching by apollo V1', iconURL: 'https://cdn.discordapp.com/emojis/1234567890.png' });
      
      await message.channel.send({ embeds: [warningEmbed] });
    }

    // Remove auto-proceed to choice after 2 minutes
    // setTimeout(async () => {
    //   const choiceCommand = client.commands.get('choice');
    //   if (choiceCommand) {
    //     await choiceCommand.execute(message, [user1.id, user2.id], client);
    //   }
    // }, 120000); // 2 minutes

    return matchMessage;
  }
}; 