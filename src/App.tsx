import { useEffect, useState } from 'react'
import './App.css'
import { BounceLoader } from 'react-spinners';

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [songName, setSongName] = useState("");
  const [artists, setArtists] = useState<string[]>([]);
  const [artUrl, setArtUrl] = useState("");
  const [songLength, setSongLength] = useState(0);
  const [spotifyUrl, setSpotifyUrl] = useState("");



  useEffect(() => {
    async function fetchSong() {
      try {
        const response = await fetch("/api/recently-played", {
        });

        if (!response.ok) {
          const data = await response.json()
          throw new Error(`Error: ${response.status} : ${data.error.message}`);
        }

        const result = await response.json();
        result.items[0]
        setSongName(result.items[0].track.name);
        setArtists([]);
        for (let artist of result.items[0].track.artists) {
          setArtists(prev => [...prev, artist.name]);
        }

        setArtUrl(result.items[0].track.album.images[0].url);
        setSongLength(result.items[0].track.duration_ms);
        setSpotifyUrl(result.items[0].track.album.external_urls.spotify)

      } catch (err: any) {
        setError(err.message)
      }
      finally {
        setLoading(false);
      }

    }
    fetchSong();
  }, [])

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
    loading ?
      <div>
        <BounceLoader color='#1ed760' loading className='loader' />
      </div>
      : error ?
        <div>
          <p>{error}</p>
        </div>
        :
        <div className='container'>
          <h1>The Current Vibes...</h1>
          <div>
            <a href={spotifyUrl} target="_blank">
              <div className="card">
                <span >
                  <svg className='logo' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M320 72C183 72 72 183 72 320C72 457 183 568 320 568C457 568 568 457 568 320C568 183 457 72 320 72zM420.7 436.9C416.5 436.9 413.9 435.6 410 433.3C347.6 395.7 275 394.1 203.3 408.8C199.4 409.8 194.3 411.4 191.4 411.4C181.7 411.4 175.6 403.7 175.6 395.6C175.6 385.3 181.7 380.4 189.2 378.8C271.1 360.7 354.8 362.3 426.2 405C432.3 408.9 435.9 412.4 435.9 421.5C435.9 430.6 428.8 436.9 420.7 436.9zM447.6 371.3C442.4 371.3 438.9 369 435.3 367.1C372.8 330.1 279.6 315.2 196.7 337.7C191.9 339 189.3 340.3 184.8 340.3C174.1 340.3 165.4 331.6 165.4 320.9C165.4 310.2 170.6 303.1 180.9 300.2C208.7 292.4 237.1 286.6 278.7 286.6C343.6 286.6 406.3 302.7 455.7 332.1C463.8 336.9 467 343.1 467 351.8C466.9 362.6 458.5 371.3 447.6 371.3zM478.6 295.1C473.4 295.1 470.2 293.8 465.7 291.2C394.5 248.7 267.2 238.5 184.8 261.5C181.2 262.5 176.7 264.1 171.9 264.1C158.7 264.1 148.6 253.8 148.6 240.5C148.6 226.9 157 219.2 166 216.6C201.2 206.3 240.6 201.4 283.5 201.4C356.5 201.4 433 216.6 488.9 249.2C496.7 253.7 501.8 259.9 501.8 271.8C501.8 285.4 490.8 295.1 478.6 295.1z" /></svg>
                </span>
                <img src={artUrl} className="artwork" alt="album art" />
                <p className='song-name'>
                  {songName}
                </p>
                <p className='artist'>
                  {artists.join(", ")}
                </p>
                <p className="song-length">
                  {formatSongLength(songLength)}
                </p>
              </div>
            </a>
          </div>
        </div>

  )
}

export default App
