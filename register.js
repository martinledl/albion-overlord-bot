/**
 * @fileoverview Utility script to register global application commands with the Discord API.
 * This script should be executed locally whenever new commands are added or existing
 * command signatures (names, descriptions, options) are modified.
 */

const APPLICATION_ID = '';
const BOT_TOKEN = '';

/**
 * The Discord API endpoint for creating or overwriting global application commands.
 * @constant {string}
 */
const DISCORD_API_URL = `https://discord.com/api/v10/applications/${APPLICATION_ID}/commands`;

/**
 * The payload defining the '/ping' slash command.
 * 
 * - `integration_types`: [0, 1] allows the command to be used if the app is installed 
 *   to a server (0) or directly to a user's account (1).
 * - `contexts`: [0, 1, 2] allows the command to be executed in a server (0), 
 *   in a direct message with the bot (1), or in a group DM / non-server channel (2).
 * 
 * @constant {Array}
 */
const COMMANDS = [
  {
    name: 'ping',
    description: 'Replies with a verification message from the Cloudflare Edge.',
    type: 1, 
    integration_types: [0, 1],
    contexts: [0, 1, 2]
  }
];

/**
 * Sends the command payload to the Discord REST API.
 * 
 * Uses an HTTP PUT request to strictly overwrite all existing global commands
 * with the provided array. This ensures the remote state perfectly matches
 * the local configuration.
 * 
 * @async
 * @function registerCommands
 * @returns {Promise} Resolves when the API successfully processes the request.
 */
async function registerCommands() {
  try {
    console.log('Initiating command registration payload transmission...');

    const response = await fetch(DISCORD_API_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bot ${BOT_TOKEN}`
      },
      body: JSON.stringify(COMMANDS)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API rejected the registration request:', errorData);
      process.exit(1);
    }

    const data = await response.json();
    console.log(`Synchronization complete. Successfully registered ${data.length} command(s).`);
  } catch (error) {
    console.error('A network or execution error occurred during registration:', error);
    process.exit(1);
  }
}

registerCommands();
