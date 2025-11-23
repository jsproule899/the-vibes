import type { SpotifyIframeApi } from "../../types/SpotifyIframeApi";

let spotifyApiPromise: Promise<SpotifyIframeApi> | null = null;

export const loadSpotifyIframeAPI = () => {
    if (spotifyApiPromise) return spotifyApiPromise;

    spotifyApiPromise = new Promise((resolve) => {
        const existing = document.getElementById("spotify-iframe");
        if (!existing) {
            const script = document.createElement("script");
            script.src = "https://open.spotify.com/embed/iframe-api/v1";
            script.id = "spotify-iframe";
            script.async = true;
            document.body.appendChild(script);
        }

        (window as any).onSpotifyIframeApiReady = (api: SpotifyIframeApi) => {
            resolve(api);
        };
    });

    return spotifyApiPromise;
};
