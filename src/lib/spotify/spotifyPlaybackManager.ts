import type { SpotifyEmbedController } from "../../types/SpotifyIframe";

let activeController: SpotifyEmbedController | null = null;

export function registerActiveController(newController: SpotifyEmbedController) {

    if (activeController && activeController !== newController) {
        activeController.pause();
    }

    activeController = newController;
}

export function getActiveController() {
    return activeController;
}
