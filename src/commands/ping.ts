import { InteractionResponseType } from 'discord-interactions';
import { Env } from '../index';

export async function execute(interaction: any, env: Env): Promise<any> {
    return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: 'Pong! The modular routing engine is working perfectly.',
        }
    };
}
