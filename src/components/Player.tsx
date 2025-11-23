import { useEffect, useRef, useState } from "react";
import { FaPauseCircle, FaPlayCircle } from "react-icons/fa";
import styles from './Player.module.css'
import { loadSpotifyIframeAPI } from "../lib/spotify/spotifyApiLoader";
import { registerActiveController } from "../lib/spotify/spotifyPlaybackManager";
import type { SpotifyEmbedController } from "../types/SpotifyIframe";


function Player({ uri, formatLength }: { uri: string, formatLength: (arg: number) => string }) {
    const [controller, setController] = useState<SpotifyEmbedController | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(30 * 1000);
    const [position, setPosition] = useState(0);

    const embedRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        let mounted = true;
        let localController: SpotifyEmbedController | null = null;

        loadSpotifyIframeAPI().then((api) => {
            if (!mounted || !embedRef.current) return;

            api.createController(
                embedRef.current,
                { width: "100%", height: "80px", uri },
                (ctrl: SpotifyEmbedController) => {
                    localController = ctrl;

                    ctrl.addListener("ready", () => {
                        if (!mounted) return;
                        ctrl.iframeElement.style.borderRadius = "14px";
                    });

                    ctrl.addListener("playback_update", (e) => {
                        if (!mounted) return;
                        const { isPaused, duration, position } = e.data;
                        setIsPlaying(!isPaused);
                        setDuration(duration);
                        setPosition(position);
                        position === duration && setIsPlaying(false);
                        position === duration && setPosition(0);

                        if (!isPaused) {
                            registerActiveController(ctrl);
                        }
                    });

                    ctrl.iframeElement.classList.add('hidden');

                    setController(ctrl);
                }
            );
        });

        return () => {
            mounted = false;
            localController?.removeListener("playback_update");
        };
    }, [uri]);

    const togglePlay = () => controller?.togglePlay();

    return (
        <>
            <div ref={embedRef} />
            <div className={styles.container}>

                <div className={styles.playBtn}>
                    {isPlaying ? <FaPauseCircle aria-label="Play" onClick={togglePlay} size={"3rem"} /> : <FaPlayCircle aria-label="Play" onClick={togglePlay} size={"3rem"} />}
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