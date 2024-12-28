import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  AudioPlayer,
} from "@discordjs/voice";
import { EmbedBuilder } from "discord.js";

type RadioStation = {
  name: string;
  url: string;
};

const radioStations: RadioStation[] = [
  { name: "Chill FM", url: "https://stream.chill.fm/stream" },
  { name: "Jazz FM", url: "https://stream.jazzfm.com/stream" },
  { name: "Pop Hits", url: "https://stream.pophits.fm/stream" },
];

let currentPlayer: AudioPlayer | null = null;
let currentConnection: any = null;
let isPlaying = false;

export async function playRadio(
  voiceChannelId: string,
  guildId: string,
  adapterCreator: any,
  stationName: string
) {
  const station = radioStations.find(
    (radio) => radio.name.toLowerCase() === stationName.toLowerCase()
  );

  if (!station) {
    throw new Error(`❌ Radio station "${stationName}" not found.`);
  }

  console.log(`🎵 Tuning into: "${station.name}"`);

  if (currentPlayer) currentPlayer.stop();
  if (
    currentConnection &&
    currentConnection.state.status !== VoiceConnectionStatus.Destroyed
  ) {
    currentConnection.destroy();
  }

  const connection = joinVoiceChannel({
    channelId: voiceChannelId,
    guildId: guildId,
    adapterCreator: adapterCreator,
  });

  connection.on(VoiceConnectionStatus.Ready, () => {
    console.log("✅ Connection ready to stream radio");
  });

  currentConnection = connection;
  isPlaying = true;

  try {
    const resource = createAudioResource(station.url, { inlineVolume: true });
    const player = createAudioPlayer();
    connection.subscribe(player);

    currentPlayer = player;
    player.play(resource);

    player.on(AudioPlayerStatus.Idle, () => {
      console.log("⏸️ Radio playback finished.");
      isPlaying = false;
    });

    return new EmbedBuilder()
      .setTitle("📻 Now Playing")
      .setDescription(`**${station.name}**`)
      .setFooter({ text: "Made with ❤️ by Alekxays" })
      .setColor("#007bff");
  } catch (error) {
    console.error(
      "❌ Une erreur est survenue lors de la lecture de la radio:",
      error
    );
    isPlaying = false;
    throw error;
  }
}

export function getAvailableStations(): string {
  return radioStations.map((station) => `**${station.name}**`).join("\n");
}
