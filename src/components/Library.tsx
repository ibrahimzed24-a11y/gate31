import { useMemo, useRef, useState } from 'react'
import { Music2, Plus, Search, Trash2, Upload, LoaderCircle, FolderPlus } from 'lucide-react'
import { cloudEnabled, pushLibrary } from '../lib/supabase'
import { useStore } from '../state/store'
import { formatTime } from '../audio/analyze'

export function Library() {
  const { tracks, crates, activeCrate, importing, error, addFiles, removeTrack, loadToDeck, createCrate, toggleInCrate, setActiveCrate, clearError } = useStore()
  const [query, setQuery] = useState('')
  const [newCrate, setNewCrate] = useState('')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const visible = useMemo(() => tracks.filter((t) => {
    const inCrate = !activeCrate || crates.find((c) => c.id === activeCrate)?.trackIds.includes(t.id)
    return inCrate && t.name.toLowerCase().includes(query.toLowerCase())
  }), [tracks, crates, activeCrate, query])

  const onFiles = (list: FileList | null) => { if (list?.length) void addFiles(Array.from(list)) }

  return (
    <section className="library panel"
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); onFiles(e.dataTransfer.files) }}>
      <div className="library-head">
        <div className="library-title"><Music2 size={18} /> LIBRARY <span className="count">{tracks.length}</span></div>
        <div className="library-actions">
          <div className="search"><Search size={15} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tracks" /></div>
          <button className="btn" onClick={() => inputRef.current?.click()} disabled={importing}>
            {importing ? <LoaderCircle size={16} className="spin" /> : <Upload size={16} />} Import
          </button>
          <button className="btn ghost" onClick={() => { navigator.clipboard.writeText(JSON.stringify({ tracks: tracks.map(({ buffer, file, ...t }) => t), crates })).catch(() => {}); void pushLibrary(tracks, crates) }} title="Sync metadata to Supabase">
            {cloudEnabled ? 'Sync ☁' : 'Export JSON'}
          </button>
          <input ref={inputRef} type="file" accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac" multiple hidden onChange={(e) => { onFiles(e.target.files); e.target.value = '' }} />
        </div>
      </div>

      {error && <div className="toast error">{error} <button onClick={clearError}>×</button></div>}
      {dragging && <div className="drop-overlay">Drop audio files to import</div>}

      <div className="library-body">
        <aside className="crates">
          <div className="crate-title">CRATES</div>
          <button className={`crate ${!activeCrate ? 'active' : ''}`} onClick={() => setActiveCrate(null)}>All tracks</button>
          {crates.map((c) => (
            <div className="crate-row" key={c.id}>
              <button className={`crate ${activeCrate === c.id ? 'active' : ''}`} onClick={() => setActiveCrate(c.id)}>{c.name} <em>{c.trackIds.length}</em></button>
            </div>
          ))}
          <form className="crate-add" onSubmit={(e) => { e.preventDefault(); createCrate(newCrate); setNewCrate('') }}>
            <input value={newCrate} onChange={(e) => setNewCrate(e.target.value)} placeholder="New crate" />
            <button type="submit" title="Create crate"><FolderPlus size={15} /></button>
          </form>
        </aside>

        <div className="track-list">
          {visible.length === 0 && <div className="empty">No tracks yet — import audio files or drag them here.</div>}
          {visible.map((t) => (
            <div className="track" key={t.id}>
              <span className="track-color" style={{ background: t.color }} />
              <div className="track-info">
                <strong>{t.name}</strong>
                <span>{formatTime(t.duration)} · {t.bpm ? `${t.bpm} BPM` : '—'}</span>
              </div>
              <div className="track-crates">
                {crates.map((c) => (
                  <button key={c.id} className={c.trackIds.includes(t.id) ? 'chip on' : 'chip'} onClick={() => toggleInCrate(c.id, t.id)} title={c.name}>{c.name.slice(0, 1)}</button>
                ))}
              </div>
              <button className="load-btn a" onClick={() => loadToDeck(0, t.id)}>A</button>
              <button className="load-btn b" onClick={() => loadToDeck(1, t.id)}>B</button>
              <button className="icon-btn danger" onClick={() => removeTrack(t.id)} title="Remove"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>
      <div className="plus-hint"><Plus size={13} /> Tip: press <kbd>Q</kbd> / <kbd>P</kbd> to play decks A / B</div>
    </section>
  )
}
