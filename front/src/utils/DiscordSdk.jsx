import { DiscordSDK } from "@discord/embedded-app-sdk";
import {sendData} from "./utils.jsx";

export const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);
export const initDiscordAuth = async () => {
    try {
        await discordSdk.ready();

        const { code } = await discordSdk.commands.authorize({
            client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
            response_type: "code",
            state: "",
            prompt: "none",
            scope: ["identify",],
        });

        return sendData({
            route:'/discord/login',
            data: {
                code,
                instance_id: discordSdk.instanceId
            },
        })

    } catch (error) {
        console.error("Discord init error :", error);
        return null;
    }
};