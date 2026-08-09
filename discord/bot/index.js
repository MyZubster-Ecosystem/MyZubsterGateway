const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
    ]
});

// Auto-role on member join
client.on('guildMemberAdd', async (member) => {
    const welcomeRole = member.guild.roles.cache.find(r => r.name === 'Community');
    if (welcomeRole) {
        await member.roles.add(welcomeRole);
        console.log(`Assigned Community role to ${member.user.tag}`);
    }
    const welcomeChannel = member.guild.channels.cache.find(c => c.name === 'benvenuto');
    if (welcomeChannel) {
        const embed = new EmbedBuilder()
            .setColor(0x6C5CE7)
            .setTitle('Benvenuto in MyZubster!')
            .setDescription(`Ciao ${member.user}! Benvenuto nel server ufficiale di MyZubster Gateway.\n\nLeggi le regole in <#${member.guild.channels.cache.find(c => c.name === 'regole')?.id || 'regole'}> e presentati!`)
            .setThumbnail(member.user.displayAvatarURL())
            .setFooter({ text: 'MyZubster Discord Bot' });
        await welcomeChannel.send({ embeds: [embed] });
    }
});

// Moderation: anti-spam (rate limiting)
const messageCount = new Map();
const SPAM_THRESHOLD = 5;
const SPAM_WINDOW = 5000;

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Anti-spam
    const now = Date.now();
    const userMsgs = messageCount.get(message.author.id) || [];
    userMsgs.push(now);
    const recent = userMsgs.filter(t => now - t < SPAM_WINDOW);
    messageCount.set(message.author.id, recent);

    if (recent.length > SPAM_THRESHOLD) {
        await message.member?.timeout(60000, 'Anti-spam: troppi messaggi');
        await message.channel.send(`${message.author}, rallenta! Sei in timeout per 1 minuto per spam.`).then(m => setTimeout(() => m.delete(), 5000));
        return;
    }

    // Command: !regole
    if (message.content === '!regole') {
        const rulesChannel = message.guild.channels.cache.find(c => c.name === 'regole');
        await message.reply(`Leggi le regole del server in ${rulesChannel || '#regole'}!`);
    }

    // Command: !info
    if (message.content === '!info') {
        const embed = new EmbedBuilder()
            .setColor(0x6C5CE7)
            .setTitle('MyZubster Gateway')
            .setDescription('Piattaforma di bounty hunting e sviluppo open source.')
            .addFields(
                { name: 'Membri', value: `${message.guild.memberCount}`, inline: true },
                { name: 'Canali', value: `${message.guild.channels.cache.size}`, inline: true },
                { name: 'GitHub', value: '[MyZubsterGateway](https://github.com/MyZubster-Ecosystem/MyZubsterGateway)', inline: true }
            );
        await message.reply({ embeds: [embed] });
    }

    // Command: !ping
    if (message.content === '!ping') {
        await message.reply(`Pong! Latency: ${client.ws.ping}ms`);
    }
});

client.once('ready', () => {
    console.log(`MyZubster Bot online as ${client.user.tag}`);
    client.user.setActivity('MyZubster Gateway', { type: 3 }); // Watching
});

client.login(process.env.DISCORD_TOKEN);
