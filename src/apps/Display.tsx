import { useState } from 'react'
import { useSystem, type Settings } from '../os/system'
import { isMuted, setMuted } from '../os/sound'
import { ScreenSaver } from '../os/Screens'
import { schemes, wallpapers, wallpaperStyle } from '../os/wallpapers'
import { useWin } from '../os/wm'

function Monitor({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="monitor">
      <div className="monitor-screen" style={style}>{children}</div>
      <div className="monitor-stand" />
    </div>
  )
}

export function DisplayProps({ args }: { args?: { tab?: string } }) {
  const { close } = useWin()
  const sys = useSystem()
  const [tab, setTab] = useState(args?.tab ?? 'Background')
  const [draft, setDraft] = useState<Settings>(sys.settings)
  const [sound, setSound] = useState(!isMuted())
  const set = (p: Partial<Settings>) => setDraft((d) => ({ ...d, ...p }))
  const apply = () => { sys.update({ ...draft, iconCells: sys.settings.iconCells }); setMuted(!sound) }

  return (
    <div className="props-dialog display-props">
      <menu role="tablist">
        {['Background', 'Screen Saver', 'Appearance', 'Effects'].map((t) => <li key={t} role="tab" aria-selected={tab === t}><a onClick={() => setTab(t)}>{t}</a></li>)}
      </menu>
      <div className="window tab-panel" role="tabpanel">
        <div className="window-body">
          {tab === 'Background' && (
            <>
              <Monitor style={{ background: 'var(--desktop)', ...wallpaperStyle(draft.wallpaper) }} />
              <p>Wallpaper</p>
              <ul className="listbox sunken">
                {wallpapers.map((w) => <li key={w.id} className={draft.wallpaper === w.id ? 'sel' : ''} onClick={() => set({ wallpaper: w.id })}>{w.name}</li>)}
              </ul>
            </>
          )}
          {tab === 'Screen Saver' && (
            <>
              <Monitor>{draft.saver !== 'none' && <ScreenSaver key={draft.saver} kind={draft.saver} text={draft.marquee} preview />}</Monitor>
              <fieldset><legend>Screen Saver</legend>
                <div className="field-row">
                  <select value={draft.saver} onChange={(e) => set({ saver: e.target.value as Settings['saver'] })}>
                    <option value="none">(None)</option><option value="starfield">Starfield Simulation</option><option value="polygons">Flying Polygons</option><option value="marquee">Scrolling Marquee</option>
                  </select>
                  <button disabled={draft.saver === 'none'} onClick={() => { apply(); close(); setTimeout(() => sys.startSaver(), 300) }}>Preview</button>
                </div>
                {draft.saver === 'marquee' && <div className="field-row"><label>Text:</label><input value={draft.marquee} maxLength={80} onChange={(e) => set({ marquee: e.target.value })} /></div>}
                <div className="field-row"><label>Wait:</label><input type="number" min={1} max={60} value={draft.saverWait} style={{ width: 48 }} onChange={(e) => set({ saverWait: Math.max(1, Math.min(60, Number(e.target.value) || 1)) })} /><span>minutes</span></div>
              </fieldset>
            </>
          )}
          {tab === 'Appearance' && (
            <>
              <div className={`scheme-preview sunken scheme-${draft.scheme}`}>
                <div className="window"><div className="title-bar inactive"><div className="title-bar-text">Inactive Window</div></div></div>
                <div className="window sp-active"><div className="title-bar"><div className="title-bar-text">Active Window</div></div><div className="window-body">Window Text <button>OK</button></div></div>
              </div>
              <div className="field-row"><label>Scheme:</label>
                <select value={draft.scheme} onChange={(e) => set({ scheme: e.target.value })}>{schemes.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
              </div>
            </>
          )}
          {tab === 'Effects' && (
            <fieldset><legend>Visual &amp; sound effects</legend>
              <div className="field-row"><input type="checkbox" id="fx-crt" checked={draft.crt} onChange={(e) => set({ crt: e.target.checked })} /><label htmlFor="fx-crt">CRT monitor effect (scanlines)</label></div>
              <div className="field-row"><input type="checkbox" id="fx-snd" checked={sound} onChange={(e) => setSound(e.target.checked)} /><label htmlFor="fx-snd">Play system sounds</label></div>
              <div className="field-row"><input type="checkbox" id="fx-drag" checked readOnly /><label htmlFor="fx-drag">Show window contents while dragging</label></div>
              <div className="field-row"><input type="checkbox" id="fx-icons" checked={false} onChange={() => sys.update({ iconCells: {} })} /><label htmlFor="fx-icons">Reset desktop icon positions</label></div>
            </fieldset>
          )}
        </div>
      </div>
      <div className="btn-row right">
        <button className="default" onClick={() => { apply(); close() }}>OK</button>
        <button onClick={close}>Cancel</button>
        <button onClick={apply}>Apply</button>
      </div>
    </div>
  )
}
