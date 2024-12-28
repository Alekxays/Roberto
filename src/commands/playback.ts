import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  AudioPlayer,
} from "@discordjs/voice";
import { QueueItem } from "./queue";
import { getAudioStreamUrl, getPlaylistVideos } from "../utils/utils";

export let currentPlayer: AudioPlayer | null = null;
export let currentConnection: any = null;
export let isPlaying = false;

export async function playNextTrack(
  voiceChannelId: string,
  guildId: string,
  adapterCreator: any,
  queue: QueueItem[]
): Promise<void> {
  if (queue.length === 0) {
    console.log("✅ Queue is empty. Stopping playback.");
    isPlaying = false;

    // Optionally disconnect the bot when queue is empty
    if (currentConnection) {
      currentConnection.destroy();
      currentConnection = null;
      console.log("❌ Connection closed due to empty queue.");
    }

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

  connection.on("error", (error) => {
    console.error("❌ Voice connection error:", error.message);
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

    player.on(AudioPlayerStatus.Playing, () => {
      console.log(`🎶 Now playing: "${track.title}"`);
    });

    player.on(AudioPlayerStatus.Idle, async () => {
      console.log("⏸️ Playback finished. Moving to the next track...");
      isPlaying = false;

      // Play the next track
      await playNextTrack(voiceChannelId, guildId, adapterCreator, queue);
    });

    player.on("error", async (error) => {
      console.error("❌ Player error:", error.message);

      if (error.message.includes("Status code: 410")) {
        console.log("🔄 Stream expired. Attempting to restart...");
        const audioUrl = await getAudioStreamUrl(track.url);
        const resource = createAudioResource(audioUrl, {
          inlineVolume: true,
          metadata: track.metadata,
        });
        player.play(resource);
      } else {
        console.log("⏭ Skipping to the next track...");
        isPlaying = false;
        await playNextTrack(voiceChannelId, guildId, adapterCreator, queue);
      }
    });
  } catch (error: unknown) {
    console.error(
      "❌ Error processing track:",
      error instanceof Error ? error.message : error
    );
    isPlaying = false;
    await playNextTrack(voiceChannelId, guildId, adapterCreator, queue);
  }
}

/**
 * Handle adding a playlist to the queue.
 * @param playlistUrl The URL of the YouTube playlist.
 * @param queue The queue array to which items should be added.
 */
export async function handlePlaylist(playlistUrl: string, queue: QueueItem[]) {
  try {
    const playlistVideos = await getPlaylistVideos(playlistUrl);
    playlistVideos.forEach((video) => {
      return queue.push({
        url: video.url,
        title: video.title,
        metadata: undefined,
      });
    });
    console.log(
      `✅ Added ${playlistVideos.length} videos from playlist to the queue.`
    );
    return playlistVideos.length;
  } catch (error: unknown) {
    console.error(
      "❌ Error processing playlist:",
      error instanceof Error ? error.message : error
    );
    throw error;
  }
}
