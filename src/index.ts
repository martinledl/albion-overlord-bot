import { verifyKey, InteractionType } from 'discord-interactions';
import * as pingCommand from './commands/ping';
import * as buildCommand from './commands/build';

export interface Env {
    DISCORD_PUBLIC_KEY: string;
}

// Map the command strings directly to their respective file handlers
const commandRegistry: Record<string, (interaction: any, env: Env) => Promise<any>> = {
    ping: pingCommand.execute,
    build: buildCommand.execute,
};

async function verifyDiscordRequest(request: Request, env: Env): Promise<{ isValid: boolean; interaction?: any }> {
    const signature = request.headers.get('x-signature-ed25519');
    const timestamp = request.headers.get('x-signature-timestamp');
    const bodyText = await request.clone().text();

    if (!signature || !timestamp || !env.DISCORD_PUBLIC_KEY) {
        return { isValid: false };
    }

    const isValid = await verifyKey(bodyText, signature, timestamp, env.DISCORD_PUBLIC_KEY);
    return { isValid, interaction: isValid ? JSON.parse(bodyText) : undefined };
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        if (request.method !== 'POST') {
            return new Response('Method Not Allowed', { status: 405 });
        }

        const { isValid, interaction } = await verifyDiscordRequest(request, env);

        if (!isValid || !interaction) {
            return new Response('Bad request signature', { status: 401 });
        }

        if (interaction.type === 1) { // InteractionType.PING
            return Response.json({ type: 1 });
        }

        if (interaction.type === 2) { // InteractionType.APPLICATION_COMMAND
            const commandName = interaction.data?.name;
            const commandHandler = commandRegistry[commandName];

            if (commandHandler) {
                try {
                    const responseBody = await commandHandler(interaction, env);
                    return Response.json(responseBody);
                } catch (error) {
                    console.error(`Error executing command /${commandName}:`, error);
                    return new Response('Internal Server Error', { status: 500 });
                }
            }
        }

        return new Response('Unhandled interaction', { status: 400 });
    },
};
