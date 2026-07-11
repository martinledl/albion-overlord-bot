import { InteractionResponseType } from 'discord-interactions';
import { Env } from '../index';

// A dictionary mapping the command values to your specific public screenshot URLs
const BUILD_DATABASE: Record<string, { title: string; url: string }> = {
    tracking_dps: {
        title: "🩸 Tracking DPS Tier List",
        url: "https://raw.githubusercontent.com/martinledl/albion-overlord-bot/refs/heads/main/assets/tracking-dps.png"
    },
    tracking_heal: {
        title: "🌱 Tracking Healer Tier List",
        url: "https://raw.githubusercontent.com/martinledl/albion-overlord-bot/refs/heads/main/assets/tracking-heal.png"
    },
    tracking_tank: {
        title: "🛡️ Tracking Tank Tier List",
        url: "https://raw.githubusercontent.com/martinledl/albion-overlord-bot/refs/heads/main/assets/tracking-tank.png"
    }
};

export async function execute(interaction: any, env: Env): Promise<any> {
    // Traverse Discord's data structure to extract our 'type' argument value
    const options = interaction.data?.options || [];
    const typeOption = options.find((opt: any) => opt.name === 'type');
    const selectedType = typeOption ? typeOption.value : null;

    // Fallback if something went structurally wrong or choice is missing
    const buildData = BUILD_DATABASE[selectedType] || {
        title: "Unknown Build Archetype",
        url: "https://i.imgur.com/ERROR_IMAGE_ID.png"
    };

    return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            embeds: [
                {
                    title: buildData.title,
                    description: `Displaying the build for **${selectedType}**.`,
                    color: 0x00ff99,
                    image: {
                        url: buildData.url
                    },
                    footer: {
                        text: "Albion Overlord Bot"
                    }
                }
            ]
        }
    };
}
