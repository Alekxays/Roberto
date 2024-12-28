export type QueueItem = {
  metadata: any;
  url: string;
  title: string;
};

export const queue: QueueItem[] = [];

export function addToQueue(url: string, title: string): void {
  queue.push({
    url,
    title,
    metadata: undefined,
  });
  console.log(`🎶 Added "${title}" to the queue.`);
}

export function showQueue(): string {
  if (queue.length === 0) {
    return "🎵 The queue is currently empty.";
  }

  return queue
    .map((track, index) => `${index + 1}. **${track.title}**`)
    .join("\n");
}
