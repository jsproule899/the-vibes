export interface SpotifyIframeApi {
    /**
     * Creates a new Spotify Embed controller.
     * @param element - The DOM element to replace with an iframe.
     * @param options - Options for the embed.
     * @param callback - Called with the created controller.
     */
    createController(
        element: HTMLElement,
        options: {
            uri: string;
            width?: string;
            height?: string;
        },
        callback: (controller: SpotifyEmbedController) => void
    ): void;
}

export interface SpotifyEmbedController {
    /** Adds an event listener. Supported events: "ready", "playback_update", "playback_started" */
    addListener(event: string, cb: (e: any) => void): void;

    /** Removes a previously added listener for an event type. */
    removeListener(event: string): void;

    /** Toggle between play and pause. */
    togglePlay(): void;

    /** Load a new Spotify URI. */
    loadUri(
        spotifyUri: string,
        preferVideo?: boolean,
        startAt?: number,
        theme?: "dark" | "light"
    ): void;

    /** Explicit control methods. */
    play(): void;
    pause(): void;
    resume(): void;
    restart(): void;
    seek(seconds: number): void;

    /** Destroys the embed and removes its DOM element. */
    destroy(): void;

    /** The iframe element that was created by the API. */
    iframeElement: HTMLIFrameElement;
}
