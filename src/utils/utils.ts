import path from "path";
import YTDlpWrap from "yt-dlp-wrap";
import ytSearch from "yt-search";

const ytDlpWrap = new YTDlpWrap(); // Spécifiez le chemin du binaire

/**
 * Fetches videos from a YouTube playlist.
 * @param playlistUrl The URL of the YouTube playlist.
 * @returns An array of video objects with URLs and titles.
 */
export async function getPlaylistVideos(
  playlistUrl: string
): Promise<{ url: string; title: string }[]> {
  try {
    const result = await ytDlpWrap.execPromise([
      "--flat-playlist",
      "-J",
      playlistUrl,
    ]);
    const json = JSON.parse(result);

    if (!json.entries || json.entries.length === 0) {
      throw new Error("No videos found in the playlist.");
    }

    return json.entries.map((entry: any) => ({
      url: `https://www.youtube.com/watch?v=${entry.id}`,
      title: entry.title || "Unknown Title",
    }));
  } catch (error) {
    console.error("❌ Error fetching playlist videos:", error);
    throw error;
  }
}

export function getAudioStreamUrl(videoUrl: string): Promise<string> {
  return ytDlpWrap
    .execPromise([
      "-f",
      "bestaudio",
      "--get-url",
      "--force-ipv4",
      "--geo-bypass",
      videoUrl,
    ])
    .then((result) => result.trim())
    .catch((error) => {
      console.error("❌ Error fetching audio URL:", error);
      throw error;
    });
}

export async function searchYouTube(
  query: string
): Promise<{ url: string; title: string }> {
  const searchResults = await ytSearch(query);
  const video = searchResults.videos[0];
  if (!video) throw new Error("❌ No results found on YouTube.");
  return { url: video.url, title: video.title };
}
