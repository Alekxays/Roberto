import {
  Client,
  GatewayIntentBits,
  Interaction,
  GuildMember,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import {
  playNextTrack,
  isPlaying,
  handlePlaylist,
  currentPlayer,
} from "./commands/playback";
import { joinVoiceChannel, VoiceConnectionStatus } from "@discordjs/voice";
import { addToQueue, showQueue, queue } from "./commands/queue";
import { searchYouTube } from "./utils/utils";
import * as dotenv from "dotenv";

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

const TOKEN = process.env.DISCORD_BOT_TOKEN;

if (!TOKEN) {
  throw new Error("The bot token is not configured in the .env file.");
}

client.once("ready", () => {
  console.log(`✅ Bot connected as ${client.user?.tag}`);
});

client.on("interactionCreate", async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction as ChatInputCommandInteraction;
  const { commandName } = command;

  try {
    if (commandName === "play") {
      const query = command.options.getString("query");
      if (!query) {
        await command.reply("❌ Please provide a song name or URL!");
        return;
      }

      if (query.includes("list=")) {
        console.log("🔗 Detected playlist URL");
        const addedCount = await handlePlaylist(query, queue);
        await command.reply(
          `🎶 Added **${addedCount}** songs to the queue from the playlist.`
        );
      } else {
        await handlePlayCommand(command);
      }
    } else if (commandName === "queue") {
      const embed = new EmbedBuilder()
        .setTitle("🎵 Current Queue")
        .setDescription(showQueue())
        .setFooter({ text: "Made with ❤️ by Alekxays" })
        .setColor("#007bff");

      await command.reply({ embeds: [embed] });
    } else if (commandName === "clear") {
      queue.length = 0;
      await command.reply("🧹 Queue has been cleared.");
    } else if (commandName === "stop") {
      await handleStopCommand(command);
    } else if (commandName === "skip") {
      await handleSkipCommand(command);
    } else if (commandName === "join") {
      await handleJoinCommand(command);
    } else {
      await command.reply("❌ Unknown command.");
    }
  } catch (error) {
    console.error(`❌ Error handling ${commandName} command:`, error);
    await command.reply("❌ An error occurred while executing the command.");
  }
});

async function handlePlayCommand(command: ChatInputCommandInteraction) {
  const query = command.options.getString("query");

  if (!query) {
    await command.reply("❌ You must provide a song name or URL!");
    return;
  }

  if (!command.guild || !(command.member as GuildMember)?.voice.channel) {
    await command.reply(
      "❌ You must be in a voice channel to use this command!"
    );
    return;
  }

  const voiceChannelId = (command.member as GuildMember).voice.channel?.id;
  const guildId = command.guild.id;
  const adapterCreator = command.guild.voiceAdapterCreator;

  try {
    let videoUrl: string;
    let videoTitle: string;

    if (query.startsWith("http")) {
      videoUrl = query;
      videoTitle = "Unknown Title";
    } else {
      const video = await searchYouTube(query);
      videoUrl = video.url;
      videoTitle = video.title;
    }

    addToQueue(videoUrl, videoTitle);

    const embed = new EmbedBuilder()
      .setTitle("🎶 Added to Queue")
      .setDescription(`**${videoTitle}**`)
      .setFooter({ text: "Made with ❤️ by Alekxays" })
      .setColor(0x00ff00);

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("skip")
        .setLabel("⏭ Skip")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("stop")
        .setLabel("⏹ Stop")
        .setStyle(ButtonStyle.Danger)
    );

    await command.reply({ embeds: [embed], components: [actionRow] });
    if (!isPlaying && voiceChannelId) {
      await playNextTrack(voiceChannelId, guildId, adapterCreator, queue);
    }
  } catch (error) {
    console.error("❌ Erreur lors du traitement de la commande /play :", error);
    await command.reply("❌ Impossible de jouer la chanson demandée.");
  }
}

async function handleJoinCommand(command: ChatInputCommandInteraction) {
  if (!command.guild || !(command.member as GuildMember)?.voice.channel) {
    await command.reply(
      "❌ You must be in a voice channel to use this command!"
    );
    return;
  }

  const voiceChannel = (command.member as GuildMember).voice.channel;

  try {
    if (!voiceChannel) {
      throw new Error("Le canal vocal ne peut pas être trouvé.");
    }
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: command.guild.id,
      adapterCreator: command.guild.voiceAdapterCreator,
    });

    connection.on(VoiceConnectionStatus.Ready, () => {
      console.log(`✅ Connected to voice channel: ${voiceChannel.name}`);
    });

    await command.reply(`✅ Joined **${voiceChannel.name}** voice channel.`);
  } catch (error) {
    console.error("❌ Error connecting to voice channel:", error);
    await command.reply("❌ Could not join the voice channel.");
  }
}

async function handleSkipCommand(interaction: ChatInputCommandInteraction) {
  if (!isPlaying) {
    await interaction.reply("❌ No music is currently playing.");
    return;
  }

  // Si un système de "skip" personnalisé est utilisé
  if (currentPlayer) {
    currentPlayer.stop(); // Arrête la piste actuelle, passe à la suivante
  }

  await interaction.reply("⏭ Skipped to the next track.");
}

async function handleStopCommand(interaction: ChatInputCommandInteraction) {
  if (!isPlaying) {
    await interaction.reply("❌ No music is currently playing.");
    return;
  }

  // Arrête la musique en cours et vide la file d'attente
  if (currentPlayer) {
    currentPlayer.stop();
  }
  queue.length = 0; // Vide la file d'attente

  await interaction.reply("⏹ Music stopped, and queue cleared.");
}

client.login(TOKEN).catch((error) => {
  console.error("Error connecting the bot:", error.message);
});
