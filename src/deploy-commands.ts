import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { SlashCommandBuilder } from "@discordjs/builders";
import * as dotenv from "dotenv";

dotenv.config();

const commands = [
  // Commande Play
  new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song or a playlist from a URL or search.")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("The name or URL of the song/playlist.")
        .setRequired(true)
    ),

  // Commande Queue
  new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Show the current music queue."),

  // Commande Skip
  new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip the currently playing song."),

  // Commande Stop
  new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop playback and clear the queue."),

  // Commande Join
  new SlashCommandBuilder()
    .setName("join")
    .setDescription("Make the bot join your current voice channel."),

  // Commande Clear
  new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clear the current queue."),
].map((command) => command.toJSON());

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
  throw new Error("Missing environment variables for Discord bot.");
}

const rest = new REST({ version: "9" }).setToken(TOKEN);

(async () => {
  try {
    console.log("🔄 Refreshing application (/) commands...");

    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });

    console.log("✅ Successfully registered application commands.");
  } catch (error) {
    console.error("❌ Error registering application commands:", error);
  }
})();
