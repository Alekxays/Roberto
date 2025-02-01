# 🎵 Roberto - Your Discord Music Bot

A complete music bot to bring life to your Discord servers! 🎧

## ✨ Features

- 🎵 Play music from YouTube and Spotify
- 📑 Queue management
- 🔊 Volume control
- 🔁 Loop mode
- 💾 Save your favorite tracks
- 🌍 Multilingual support
- 🎭 Configurable DJ mode

## ⚙️ Configuration

Important! Rename `.env.example` to `.env`

## 📌 Prerequisites

- [Node.js](https://nodejs.org/) (version 18.20.2)
- [FFmpeg](https://www.ffmpeg.org)
- [npm]

## 🚀 Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Configure your `.env` file
4. Start the bot:
```bash
npm start
```

## 🌐 Supported Languages

Roberto speaks multiple languages! Some examples:
- 🇬🇧 English (en)
- 🇫🇷 French (fr)
- 🇪🇸 Spanish (es)
- 🇩🇪 German (de)
- 🇮🇹 Italian (it)
- 🇯🇵 Japanese (ja)

## 🛠️ Support

Need help? Have questions? Join our support Discord server!

## 🎮 Commands

- `/play` - Play a song from YouTube or Spotify
- `/pause` - Pause the current track
- `/resume` - Resume playback
- `/skip` - Skip to the next track
- `/queue` - View current queue
- `/volume` - Adjust the volume
- `/save` - Save current track to your favorites
- `/loop` - Toggle loop mode

## 🔧 Advanced Configuration

### DJ Mode
Enable DJ mode to restrict certain commands to specific roles:
```js
opt: {
    DJ: {
        enabled: true,
        roleName: 'DJ',
        commands: ['volume', 'clear', 'filter']
    }
}
```

### Player Settings
```js
opt: {
    maxVol: 100,
    spotifyBridge: true,
    volume: 75,
    leaveOnEmpty: true,
    leaveOnEnd: true
}
```

## 📝 License

Made with ❤️ by Alekxays

⚠️ Please keep the credits and license in this project.
Credit to this repo : https://github.com/ZerioDev/Music-bot

---

For support or suggestions, feel free to open an issue on GitHub.