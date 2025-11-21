import { useEffect, useRef, useState } from "react";
import { FaPauseCircle, FaPlayCircle } from "react-icons/fa";
import styles from './Player.module.css'

type SpotifyIframeApi = {
    createController: (
        element: HTMLElement,
        options: { uri: string; width: string; height: string },
        callback: (controller: SpotifyEmbedController) => void
    ) => void;
};

type SpotifyEmbedController = {
    addListener: (event: string, cb: (e: any) => void) => void;
    removeListener: (event: string) => void;
    togglePlay: () => void;
    iframeElement: HTMLIFrameElement;
};

function Player({ uri, formatLength }: { uri: string, formatLength: (arg: number) => string }) {
    const [iFrameAPI, setIFrameAPI] = useState<SpotifyIframeApi | null>(null);
    const [playerLoaded, setPlayerLoaded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(30 * 1000);
    const [position, setPosition] = useState(0);

    const embedRef = useRef<HTMLDivElement | null>(null);
    const spotifyEmbedControllerRef = useRef<SpotifyEmbedController | null>(null);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://open.spotify.com/embed/iframe-api/v1";
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    useEffect(() => {

        if (iFrameAPI) return;

        (window as any).window.onSpotifyIframeApiReady = (api: SpotifyIframeApi) => {
            setIFrameAPI(api);
        };
    }, [iFrameAPI]);

    useEffect(() => {
        if (playerLoaded || !iFrameAPI || !embedRef.current) {
            return;
        }

        iFrameAPI.createController(
            embedRef.current,
            {
                width: "100%",
                height: "80px",
                uri
            },
            (controller: SpotifyEmbedController) => {
                controller.addListener("ready", () => {
                    setPlayerLoaded(true);
                    controller.iframeElement.style.borderRadius = "14px";
                });

                controller.addListener("playback_update", (e) => {
                    const { isPaused, position, duration } = e.data;
                    setIsPlaying(!isPaused);
                    setDuration(duration);
                    setPosition(position);
                    position === duration && setIsPlaying(false)
                    position === duration && setPosition(0);
                });

                controller.addListener("playback_started", (e) => {
                    const { playingURI } = e.data;
                    console.log(`The playback has started for: ${playingURI}`);
                });

                spotifyEmbedControllerRef.current = controller;
                controller.iframeElement.classList.add("hidden");
            }
        );


        return () => {
            spotifyEmbedControllerRef.current?.removeListener("playback_update");
        };

    }, [playerLoaded, iFrameAPI, uri]);

    const onPlayClick = async () => {
        spotifyEmbedControllerRef.current?.togglePlay();
    };

    return (
        <>
            <div ref={embedRef} />
            <div className={styles.container}>

                <div className={styles.playBtn}>
                    {isPlaying ? <FaPauseCircle aria-label="Play" onClick={onPlayClick} size={"3rem"} /> : <FaPlayCircle aria-label="Play" onClick={onPlayClick} size={"3rem"} />}
                </div>

                <div className={styles.progressContainer}>
                    <div className={styles.preview}>
                        < span className={styles.previewTag}>Preview</span>
                        <p className={styles.previewLength}> {formatLength(position)} / {formatLength(duration)}</p>
                    </div>

                    <div className={styles.progressBar}>
                        <div className={styles.progress} style={{ width: `${Math.min(100, Math.max(0, (position / duration) * 100))}%` }} />
                    </div>

                </div>

            </div >
        </>
    )
}

export default Player