import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  AudioPlayer,
} from "@discordjs/voice";
import YTDlpWrap from "yt-dlp-wrap";

type QueueItem = {
  url: string;
  title: string;
};

let currentPlayer: AudioPlayer | null = null;
let currentConnection: any = null;
let queue: QueueItem[] = [];
let isPlaying = false;

const ytDlpWrap = new YTDlpWrap();

export async function playNextTrack(
  voiceChannelId: string,
  guildId: string,
  adapterCreator: any
): Promise<void> {
  if (queue.length === 0) {
    console.log("✅ Queue is empty. Stopping playback.");
    isPlaying = false;
    return;
  }

  const track = queue.shift();
  if (!track) return;

  console.log(`🎵 Now playing: "${track.title}"`);

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
    console.log("✅ Connection ready to stream audio");
  });

  currentConnection = connection;
  isPlaying = true;

  try {
    const audioUrl = await getAudioStreamUrl(track.url);
    const resource = createAudioResource(audioUrl, {
      inlineVolume: true,
      metadata: { title: track.title },
    });

    const player = createAudioPlayer();
    connection.subscribe(player);

    currentPlayer = player;
    player.play(resource);

    player.on(AudioPlayerStatus.Idle, async () => {
      console.log("⏸️ Playback finished.");
      isPlaying = false;
      await playNextTrack(voiceChannelId, guildId, adapterCreator);
    });
  } catch (error) {
    console.error("❌ An error occurred:", error);
    isPlaying = false;
    await playNextTrack(voiceChannelId, guildId, adapterCreator);
  }
}

async function getAudioStreamUrl(videoUrl: string): Promise<string> {
  return ytDlpWrap
    .execPromise(["-f", "bestaudio", "--get-url", videoUrl])
    .then((result) => result.trim())
    .catch((error) => {
      console.error("❌ Error fetching audio URL:", error);
      throw error;
    });
}

export function addToQueue(url: string, title: string) {
  queue.push({ url, title });
}

export function showQueue(): string {
  if (queue.length === 0) {
    return "🎵 The queue is currently empty.";
  }

  return queue
    .map((track, index) => `${index + 1}. **${track.title}**`)
    .join("\n");
}
