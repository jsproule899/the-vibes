import { useEffect, useState } from 'react'
import './App.css'
import { BeatLoader, BounceLoader } from 'react-spinners';
import type { Song } from './types/Song';
import Card from './components/Card';

function App() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showingPastVibes, setShowingPastVibes] = useState(false);
  const [error, setError] = useState("");
  const MAX_SONGS = 50;

  useEffect(() => {
    loadInitialSong();
  }, []);

  useEffect(() => {
    if (!showingPastVibes) return;
    const marker = document.getElementById("load-more-marker");
    if (!marker) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMoreSongs();
      },
      { rootMargin: "150px" }
    );

    observer.observe(marker);
    return () => observer.disconnect();
  }, [showingPastVibes, songs]);

  async function loadInitialSong() {
    try {
      setLoading(true);
      const response = await fetch("/api/recently-played");
      if (!response.ok) throw await response.json();
      const result = await response.json();
      const firstSong = result.items.map(mapItemToSong);
      setSongs(firstSong);
    } catch (err: any) {
      setError(err.message || "Failed to fetch songs");
    } finally {
      setLoading(false);
    }
  }

  async function loadMoreSongs() {
    if (loadingMore || songs.length >= MAX_SONGS) return;

    try {
      setLoadingMore(true);
      const oldestPlayedAt = new Date(songs[songs.length - 1].played_at).getTime();
      const response = await fetch(
        `/api/recently-played?limit=10&before=${oldestPlayedAt}`
      );
      if (!response.ok) throw await response.json();
      const result = await response.json();
      const newSongs = result.items.map(mapItemToSong);
      setSongs(prev => [...prev, ...newSongs]);
    } catch (err: any) {
      setError(err.message || "Failed to fetch more songs");
    } finally {
      setLoadingMore(false);
    }
  }

  function mapItemToSong(item: any): Song {
    return {
      name: item.track.name,
      artists: item.track.artists.map((a: any) => a.name),
      artworkUrl: item.track.album.images[0].url,
      length: item.track.duration_ms,
      spotifyUrl: item.track.external_urls.spotify,
      spotifyUri: item.track.uri,
      played_at: item.played_at,
    }
  }

  function handleShowPastVibes() {
    setShowingPastVibes(true);
    loadMoreSongs();
  }

  if (loading) return (
    <BounceLoader color='#1ed760' loading className='loader' />
  );

  if (error) return (
    <div>
      <p>{error}</p>
    </div>
  );

  if (songs.length === 0) return (
    <div>
      <p>Can't get vibes at the moment</p>
    </div>
  )

  return (
    <div className='container'>
      <h1 className='header'>The Current Vibes...</h1>
      <div className='songsList'>
        {
          songs.map((song) => <Card key={song.spotifyUri} song={song} />)
        }
      </div>
      {!showingPastVibes && <p className='actionText' onClick={handleShowPastVibes}>Past Vibes...</p>}
      <div id="load-more-marker" />
      {loadingMore && <BeatLoader color='#1ed760' loading={loadingMore} />}
    </div>
  )
}

export default App
