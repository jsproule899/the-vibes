import { useEffect, useState } from 'react'
import './App.css'
import { BounceLoader } from 'react-spinners';
import type { Song } from './types/Song';
import Card from './components/Card';

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [song, setSong] = useState<Song>();

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

        setSong({
          name: result.items[0].track.name,
          artists: result.items[0].track.artists.map((artist: any) => artist.name),
          artworkUrl: result.items[0].track.album.images[0].url,
          length: result.items[0].track.duration_ms,
          spotifyUrl: result.items[0].track.album.external_urls.spotify,
        })

      } catch (err: any) {
        setError(err.message)
      }
      finally {
        setLoading(false);
      }
    }
    fetchSong();
  }, [])


  if (loading) return (
    <BounceLoader color='#1ed760' loading className='loader' />
  );

  if (error) return (
    <div>
      <p>{error}</p>
    </div>
  );

  if (!song) return (
    <div>
      <p>Can't get vibes at the moment</p>
    </div>
  )

  return (
    <div className='container'>
      <h1 className='header'>The Current Vibes...</h1>
      <div>
        <a href={song.spotifyUrl} target="_blank">
          <Card song={song} />
        </a>
      </div>
    </div>

  )
}

export default App
