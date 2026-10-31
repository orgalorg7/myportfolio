import { useEffect, useRef, useState } from 'react'
import { playlist } from '../data/profile'
import { coarsePointer } from '../astra/term'
import { MenuBar } from '../os/ui'
import { useWin, useWM } from '../os/wm'

/*
 * A Windows Media Player-style front end for YouTube's official embedded player.
 * Every track streams from the artist's own (or label's) upload; nothing is hosted here.
 */
type Args = { youtube?: string } | undefined

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global { interface Window { YT?: any; onYouTubeIframeAPIReady?: () => void } }

let ytReady: Promise<any> | null = null
function loadYouTube(): Promise<any> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  ytReady ??= new Promise((resolve, reject) => {
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(window.YT) }
    const s = document.createElement('script')
    s.src = 'https://www.youtube.com/iframe_api'
    s.onerror = () => { ytReady = null; reject(new Error('Could not reach YouTube')) }
    document.head.appendChild(s)
  })
  return ytReady
}

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`
const indexOf = (args: Args) => Math.max(0, playlist.findIndex((t) => t.youtube === args?.youtube))

type PlayState = 'loading' | 'playing' | 'paused' | 'stopped' | 'ended' | 'error'

export function MediaPlayer({ args }: { args: Args }) {
  const wm = useWM()
  const { setTitle, close } = useWin()
  const host = useRef<HTMLDivElement>(null)
  const player = useRef<any>(null)
  const ready = useRef(false)
  const [index, setIndex] = useState(() => indexOf(args))
  const [state, setState] = useState<PlayState>('loading')
  const [time, setTime] = useState(0)
  const [dur, setDur] = useState(0)
  const [vol, setVol] = useState(80)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState(true)
  const [error, setError] = useState('')
  const seeking = useRef(false)
  const track = playlist[index]
  const list = useRef<HTMLDivElement>(null)

  // Opening a specific track while the player is already open switches to it.
  useEffect(() => { if (args?.youtube) setIndex(indexOf(args)) }, [args])
  useEffect(() => { setTitle(`${track.title} - Media Player`) }, [track, setTitle])
  // Keep the current track visible in the playlist (matters most on phones, where the list scrolls).
  useEffect(() => { list.current?.querySelector('.mp-item.on')?.scrollIntoView({ block: 'nearest' }) }, [index])

  const next = (dir = 1) => {
    setIndex((i) => {
      if (shuffle && playlist.length > 1) {
        let r = i
        while (r === i) r = Math.floor(Math.random() * playlist.length)
        return r
      }
      const n = i + dir
      if (n >= playlist.length) return repeat ? 0 : i
      return n < 0 ? playlist.length - 1 : n
    })
  }
  const nextRef = useRef(next)
  nextRef.current = next
  const indexRef = useRef(index)
  const loaded = useRef(playlist[index].youtube)
  indexRef.current = index

  // Create the YouTube player once.
  useEffect(() => {
    let disposed = false
    const mount = document.createElement('div')
    host.current!.appendChild(mount)
    loadYouTube().then((YT) => {
      if (disposed) return
      player.current = new YT.Player(mount, {
        host: 'https://www.youtube-nocookie.com',
        videoId: playlist[index].youtube,
        width: '100%', height: '100%',
        // Phones often only start YouTube from a tap inside the video, so touch screens get YouTube's own controls.
        playerVars: { autoplay: 1, controls: coarsePointer() ? 1 : 0, disablekb: 1, modestbranding: 1, rel: 0, playsinline: 1, iv_load_policy: 3, fs: 0, origin: window.location.origin },
        events: {
          // Clear the "Opening..." overlay once ready: if the browser blocks autoplay, the user needs to see the player and press Play.
          onReady: (e: any) => {
            ready.current = true
            e.target.setVolume(vol)
            setState((st) => (st === 'loading' ? 'stopped' : st))
            // A track picked while YouTube was still loading.
            const want = playlist[indexRef.current].youtube
            if (want !== loaded.current) { loaded.current = want; e.target.loadVideoById(want) } else e.target.playVideo()
          },
          onStateChange: (e: any) => {
            const S = YT.PlayerState
            if (e.data === S.PLAYING) { setState('playing'); setError(''); setDur(e.target.getDuration() || 0) }
            else if (e.data === S.PAUSED) setState('paused')
            else if (e.data === S.ENDED) { setState('ended'); nextRef.current(1) }
            else if (e.data === S.BUFFERING) setDur(e.target.getDuration() || 0)
            else if (e.data === S.CUED || e.data === S.UNSTARTED) setState((st) => (st === 'loading' ? 'stopped' : st))
          },
          onError: (e: any) => {
            setState('error')
            setError(e.data === 101 || e.data === 150 ? 'The owner doesn\'t allow this track to be played here.' : 'This track could not be played.')
          },
        },
      })
    }).catch((err) => { if (!disposed) { setState('error'); setError(`${String(err.message ?? err)}. Check your connection.`) } })
    const t = setInterval(() => {
      const p = player.current
      if (p?.getCurrentTime && !seeking.current) setTime(p.getCurrentTime() || 0)
    }, 250)
    return () => { disposed = true; clearInterval(t); try { player.current?.destroy() } catch { /* not ready */ } mount.remove() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Switch tracks without rebuilding the player.
  useEffect(() => {
    if (!ready.current || loaded.current === track.youtube) return
    loaded.current = track.youtube
    setTime(0); setDur(0); setState('loading')
    player.current?.loadVideoById(track.youtube)
  }, [track])

  const p = () => player.current
  const playPause = () => (state === 'playing' ? p()?.pauseVideo() : p()?.playVideo())
  const stop = () => { p()?.stopVideo(); setTime(0); setState('stopped') }
  const seek = (s: number) => { const v = Math.max(0, Math.min(dur || s, s)); p()?.seekTo(v, true); setTime(v) }
  const setVolume = (v: number) => { setVol(v); p()?.setVolume(v); if (v > 0) p()?.unMute() }
  const pick = (i: number) => { if (i === index) { p()?.seekTo(0, true); p()?.playVideo() } else setIndex(i) }

  const statusText = { loading: 'Opening media...', playing: 'Playing', paused: 'Paused', stopped: 'Stopped', ended: 'Finished', error: 'Error' }[state]
  let lastGroup: string | undefined

  return (
    <div className="mediaplayer">
      <MenuBar menus={[
        { label: '&File', items: [{ label: 'Open on &YouTube', onClick: () => window.open(`https://www.youtube.com/watch?v=${track.youtube}`, '_blank', 'noopener') }, { sep: true }, { label: 'E&xit', onClick: close }] },
        { label: '&Play', items: [
          { label: state === 'playing' ? '&Pause' : '&Play', onClick: playPause }, { label: '&Stop', onClick: stop },
          { sep: true },
          { label: '&Previous Track', onClick: () => next(-1) }, { label: '&Next Track', onClick: () => next(1) },
          { sep: true },
          { label: 'S&huffle', checked: shuffle, onClick: () => setShuffle((v) => !v) }, { label: '&Repeat Playlist', checked: repeat, onClick: () => setRepeat((v) => !v) },
        ] },
        { label: '&Help', items: [{ label: '&About', onClick: () => wm.alert({ title: 'About Media Player', icon: 'info', message: `Nehad's playlist: ${playlist.length} tracks.\n\nEvery song streams from the artist's or label's official YouTube upload through YouTube's embedded player (privacy-enhanced mode). No audio is stored on this site.` }) }] },
      ]} />
      <div className="mp-main">
        <div className="mp-left">
          <div className="mp-video">
            <div ref={host} className="mp-frame" />
            {state === 'error' && <div className="mp-error"><p>{error}</p><a href={`https://www.youtube.com/watch?v=${track.youtube}`} target="_blank" rel="noreferrer">Open on YouTube ↗</a><button onClick={() => next(1)}>Skip to next track</button></div>}
            {state === 'loading' && <div className="mp-loading">Opening {track.title}...</div>}
          </div>
          <div className="mp-now">
            <b>{track.title}</b>
            <span>{track.artist} · {track.album} ({track.year})</span>
          </div>
          <div className="mp-seekrow">
          <span className="mp-time">{fmt(time)}</span>
          <input className="mp-seek" type="range" min={0} max={Math.max(1, Math.floor(dur))} step={1} value={Math.floor(time)} aria-label="Seek"
            onPointerDown={() => { seeking.current = true }}
            onChange={(e) => setTime(Number(e.target.value))}
            onPointerUp={(e) => { seeking.current = false; seek(Number((e.target as HTMLInputElement).value)) }}
            onKeyUp={(e) => seek(Number((e.target as HTMLInputElement).value))} />
          <span className="mp-time">{fmt(dur)}</span>
          </div>
          <div className="mp-controls">
            <button className="mp-btn wide mp-play" onClick={playPause} aria-label={state === 'playing' ? 'Pause' : 'Play'}>{state === 'playing' ? '❚❚' : '▶'}</button>
            <button className="mp-btn mp-desk" onClick={stop} aria-label="Stop">■</button>
            <span className="mp-sep mp-desk" />
            <button className="mp-btn mp-prev" onClick={() => next(-1)} aria-label="Previous track">|◀◀</button>
            <button className="mp-btn mp-desk" onClick={() => seek(time - 10)} aria-label="Rewind 10 seconds">◀◀</button>
            <button className="mp-btn mp-desk" onClick={() => seek(time + 10)} aria-label="Forward 10 seconds">▶▶</button>
            <button className="mp-btn mp-next" onClick={() => next(1)} aria-label="Next track">▶▶|</button>
            <span className="mp-sep mp-desk" />
            <button className={`mp-btn toggle mp-shuf ${shuffle ? 'on' : ''}`} onClick={() => setShuffle((v) => !v)} aria-pressed={shuffle} title="Shuffle" aria-label="Shuffle">⤮</button>
            <button className={`mp-btn toggle mp-rep ${repeat ? 'on' : ''}`} onClick={() => setRepeat((v) => !v)} aria-pressed={repeat} title="Repeat playlist" aria-label="Repeat playlist">⟳</button>
            <span className="mp-vol mp-desk">
              <span aria-hidden="true">🔊</span>
              <input type="range" min={0} max={100} value={vol} onChange={(e) => setVolume(Number(e.target.value))} aria-label="Volume" />
            </span>
          </div>
          <div className="mp-info sunken">
            <div><span>Show:</span>{track.artist}</div>
            <div><span>Clip:</span>{track.title}</div>
            <div><span>Album:</span>{track.album} ({track.year})</div>
            {track.note && <div><span>Note:</span>{track.note}</div>}
          </div>
        </div>
        <div ref={list} className="mp-list sunken" role="listbox" aria-label="Playlist">
          <div className="mp-list-head">Nehad's Playlist · {playlist.length} tracks</div>
          {playlist.map((t, i) => {
            const header = t.group && t.group !== lastGroup ? t.group : null
            lastGroup = t.group
            return (
              <div key={t.youtube}>
                {header && <div className="mp-group">{header}</div>}
                <div role="option" aria-selected={i === index} tabIndex={0}
                  className={`mp-item ${i === index ? 'on' : ''}`}
                  onClick={() => pick(i)} title={`Play ${t.title}`}
                  onKeyDown={(e) => e.key === 'Enter' && pick(i)}>
                  <span className="mp-num">{i === index && state === 'playing' ? '♪' : `${i + 1}.`}</span>
                  <span className="mp-t"><b>{t.title}</b><small>{t.artist} · {t.year}</small></span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="status-bar">
        <p className="status-bar-field">{statusText} · Track {index + 1} of {playlist.length}</p>
        <p className="status-bar-field sb-narrow">{fmt(time)} / {fmt(dur)}</p>
      </div>
    </div>
  )
}
