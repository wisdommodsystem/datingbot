# 🤖 WISDBOT - Voice Matchmaking Bot

A Discord bot that facilitates voice-based matchmaking between users with Moroccan Darija questions and messages.

## 📋 Features

### 🎯 Core Commands

- **`!match`** - Randomly picks 2 users from voice channel and starts matchmaking
- **`!choice`** - Users vote if they like each other (👍/👎)
- **`!nextlevel`** - Sends 5 random +18 Darija questions to couples
- **`!lastchance`** - Final decision to continue or end relationship (❤️/💔)
- **`!newcouple`** - Creates shared role for successful couples
- **`!couples`** - Lists all couples from database
- **`!breakup`** - Ends a couple relationship (Admin only)
- **`!leave`** - Makes bot leave voice channel (Admin only)
- **`!checkstage`** - Check current stage of a couple
- **`!debug`** - Debug command for testing (Admin only)

### 🔄 Matchmaking Flow

1. **Match Phase** - Bot randomly selects 2 users from voice channel
2. **Choice Phase** - Users vote if they like each other
3. **Questions Phase** - +18 Darija questions for deeper connection
4. **Final Phase** - Decision to continue or end relationship
5. **Role Creation** - Shared role for successful couples

## 🚀 Setup Instructions

### 1. Prerequisites

- Node.js (v16 or higher)
- Discord Bot Token
- Discord Server with appropriate permissions

### 2. Installation

```bash
# Clone or download the project
cd WISDBOT

# Install dependencies
npm install

# Copy environment file
cp env.example .env
```

### 3. Configuration

Edit the `.env` file:
```env
DISCORD_TOKEN=your_discord_bot_token_here
BOT_PREFIX=!
```

### 4. Bot Permissions

Make sure your bot has these permissions:
- **Manage Roles** - For creating couple roles
- **Send Messages** - For sending embeds
- **Add Reactions** - For voting system
- **Read Message History** - For reaction handling
- **Connect** - For voice channel access
- **Speak** - For voice channel interaction
- **View Channels** - For channel access
- **Manage Channels** - For voice channel management

### 5. Running the Bot

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

## 📁 File Structure

```
WISDBOT/
├── data/
│   └── matches.json          # Couples data storage
├── questions/
│   └── l7wafile.js          # +18 Darija questions
├── src/
│   ├── index.js             # Main bot file
│   ├── utils/
│   │   └── matchManager.js  # Match data management
│   └── commands/
│       ├── match.js         # Match command
│       ├── choice.js        # Choice command
│       ├── nextlevel.js     # Questions command
│       ├── lastchance.js    # Final decision command
│       ├── newcouple.js     # Role creation command
│       ├── couples.js       # List couples command
│       └── breakup.js       # Breakup command
├── package.json
├── env.example
└── README.md
```

## 🎮 Usage Examples

### Starting a Match
```
!match
```
- User must be in a voice channel
- Bot randomly selects 2 users
- 2-minute interaction period

### Voting Process
```
!choice
```
- Users react with 👍 or 👎
- Both must vote for result
- Success leads to questions phase

### Questions Phase
```
!nextlevel
```
- Sends 5 random +18 Darija questions
- Only available after successful choice
- 30-second follow-up to lastchance

### Final Decision
```
!lastchance
```
- Users react with ❤️ or 💔
- Determines if relationship continues
- Success leads to role creation

### Creating Shared Role
```
!newcouple اسم_الرول
```
- Creates role with specified name
- Assigns to both users
- Updates database with role info

### Viewing Couples
```
!couples
```
- Lists all couples in database
- Shows stage, role, and date info

### Breaking Up
```
!breakup @user
```
- Admin command to end relationships
- Removes shared roles
- Deletes from database

## 🔧 Customization

### Adding Questions
Edit `questions/l7wafile.js` to add more Darija questions:
```javascript
module.exports = [
  "سؤال جديد هنا؟",
  "سؤال آخر؟",
  // ... more questions
];
```

### Modifying Stages
The bot uses 4 stages:
1. **Stage 1** - Initial match
2. **Stage 2** - After choice
3. **Stage 3** - After questions
4. **Stage 4** - After final decision

### Database Structure
```json
{
  "couples": [
    {
      "user1": "user_id_1",
      "user2": "user_id_2",
      "stage": 4,
      "matched_at": "2025-01-01T00:00:00.000Z",
      "role": "اسم_الرول"
    }
  ]
}
```

## 🛠️ Troubleshooting

### Common Issues

1. **Bot not responding**
   - Check if token is correct
   - Verify bot has proper permissions
   - Check console for errors

2. **Reactions not working**
   - Ensure bot has "Add Reactions" permission
   - Check if message is still available

3. **Role creation fails**
   - Verify bot has "Manage Roles" permission
   - Check if role name is valid
   - Ensure bot role is above target role

4. **Voice channel issues**
   - Make sure users are in voice channel
   - Check bot's voice permissions

### Debug Mode

Add this to your `.env` file for detailed logging:
```env
DEBUG=true
```

## 📝 License

MIT License - Feel free to modify and distribute!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review Discord.js documentation
- Ensure all permissions are set correctly

---

**Note**: This bot is designed for adult content (+18) and should be used responsibly in appropriate Discord servers. 