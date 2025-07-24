const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const matchManager = require('../utils/matchManager');

module.exports = {
  data: {
    name: 'finana',
    description: 'List all servers the bot is in (name, ID, owner)'
  },

  async execute(message, args, client) {
    // Admin or privileged only
    const isPrivileged = matchManager.isPrivilegedUser(message.author.id);
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator) && !isPrivileged) {
      return message.reply('❌ ما عندكش صلاحية باش تستعمل هذا الأمر!');
    }

    const guilds = client.guilds.cache.map(g => g);
    if (guilds.length === 0) {
      return message.reply('❌ البوت ما فيه حتى سيرفر!');
    }

    // Fetch owners for all guilds
    const guildInfos = await Promise.all(guilds.map(async (guild) => {
      let owner = null;
      try {
        owner = await guild.fetchOwner();
      } catch {
        owner = { user: { tag: 'غير متاح', id: 'N/A' }, id: 'N/A' };
      }
      return {
        name: guild.name,
        id: guild.id,
        ownerTag: owner.user ? owner.user.tag : owner.tag,
        ownerId: owner.user ? owner.user.id : owner.id
      };
    }));

    // Pagination (show up to 10 per page)
    const perPage = 10;
    const total = guildInfos.length;
    const pages = Math.ceil(total / perPage);
    let page = 1;
    const getPageEmbed = (pageNum) => {
      const start = (pageNum - 1) * perPage;
      const end = start + perPage;
      const pageGuilds = guildInfos.slice(start, end);
      return new EmbedBuilder()
        .setColor('#00BFFF')
        .setTitle('━━━━━━━━━━━━━━━━━━━━━━━━━━\n🌐 **سيرفرات البوت** 🌐\n━━━━━━━━━━━━━━━━━━━━━━━━━━')
        .setDescription(`**عدد السيرفرات:** \`${total}\`\nصفحة \`${pageNum}/${pages}\``)
        .addFields(
          pageGuilds.map((g, i) => ({
            name: `#${start + i + 1} • ${g.name}`,
            value: `🆔 **ID:** \`${g.id}\`\n👑 **Owner:** <@${g.ownerId}> (\`${g.ownerTag}\` | \`${g.ownerId}\`)
`,
            inline: false
          }))
        )
        .setThumbnail('https://cdn.discordapp.com/emojis/1234567890.png')
        .setFooter({ text: `WisdomMatching by apollo V1 • Matchmaking Event`, iconURL: 'https://cdn.discordapp.com/emojis/1234567890.png' })
        .setTimestamp();
    };

    // If only one page, just send it
    if (pages === 1) {
      return message.channel.send({ embeds: [getPageEmbed(1)] });
    }

    // If multiple pages, add navigation
    let sent = await message.channel.send({ embeds: [getPageEmbed(page)] });
    await sent.react('⬅️');
    await sent.react('➡️');

    const filter = (reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === message.author.id;
    const collector = sent.createReactionCollector({ filter, time: 120000 });

    collector.on('collect', async (reaction, user) => {
      if (reaction.emoji.name === '⬅️' && page > 1) {
        page--;
        await sent.edit({ embeds: [getPageEmbed(page)] });
      } else if (reaction.emoji.name === '➡️' && page < pages) {
        page++;
        await sent.edit({ embeds: [getPageEmbed(page)] });
      }
      await reaction.users.remove(user.id);
    });
  }
}; 