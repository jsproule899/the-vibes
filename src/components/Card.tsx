import type { Song } from "../types/Song"
import styles from './Card.module.css'
import { FaSpotify } from "react-icons/fa";
import Player from "./Player";

interface CardProps {
    song: Song;
}

function Card({ song }: CardProps) {

    function pad(num: number, size?: number) {
        var s = String(num);
        while (s.length < (size || 2)) { s = "0" + s; }
        return s;
    }

    function formatSongLength(lengthMs: number) {
        let totalSeconds = lengthMs / 1000;
        let mins = Math.floor(totalSeconds / 60);
        let seconds = Math.floor(totalSeconds % 60);

        return `${mins}:${pad(seconds)}`
    }


    return (
        <div className={styles.card}>
            <span >
                <a href={song.spotifyUrl} target="_blank">
                    <FaSpotify className={styles.logo} size={"20%"} />
                </a>
            </span>
            <img src={song.artworkUrl} className={styles.artwork} alt="album art" />
            <p className={styles.songName}>
                {song.name}
            </p> <p className={styles.songLength}>
                {formatSongLength(song.length)}
            </p>
            <p className={styles.artist}>
                {song.artists.join(", ")}
            </p>
            <Player uri={song.spotifyUri} formatLength={formatSongLength} />
        </div>
    )
}

export default Card