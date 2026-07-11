import { verifyKey, InteractionType, InteractionResponseType } from 'discord-interactions';

export interface Env {
    DISCORD_PUBLIC_KEY: string;
}

export default {
    async fetch(request: Request, env: Env): Promise {
        if (request.method !== 'POST') {
            return new Response('Method Not Allowed', { status: 405 });
        }

        const signature = request.headers.get('x-signature-ed25519');
        const timestamp = request.headers.get('x-signature-timestamp');
        const bodyText = await request.text(); 

        if (!signature || !timestamp || !env.DISCORD_PUBLIC_KEY) {
            console.log("❌ REJECTED: Missing headers or public key.");
            return new Response('Bad request', { status: 401 });
        }

        const isValid = await verifyKey(bodyText, signature, timestamp, env.DISCORD_PUBLIC_KEY);
        console.log("4. Cryptographic Match: ", isValid ? "PASSED" : "FAILED");

        if (!isValid) {
            console.log("❌ REJECTED: Signature invalid. The Public Key does not match the payload.");
            return new Response('Bad request signature', { status: 401 });
        }

        const interaction = JSON.parse(bodyText);
        console.log("Interaction Type: ", interaction.type);

        if (interaction.type === InteractionType.PING) {
            console.log("✅ SUCCESS: Responding with PONG");
            return Response.json({ type: InteractionResponseType.PONG });
        }

        if (interaction.type === InteractionType.APPLICATION_COMMAND) {
            const commandName = interaction.data?.name;
            console.log("✅ SUCCESS: Executing command /" + commandName);

            if (commandName === 'ping') {
                return Response.json({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: 'Pong! Diagnostics are running perfectly.',
                    },
                });
            }
        }

        return new Response('Unhandled interaction', { status: 400 });
    },
};
