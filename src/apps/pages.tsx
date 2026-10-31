import { useState, type ReactNode } from 'react'
import { profile } from '../data/profile'
import { categories, projectById, projects, projectsIn, type Project } from '../data/projects'
import { Icon } from '../os/icons'
import { useWM } from '../os/wm'

type Nav = (u: string) => void

export function pageTitle(url: string) {
  const path = url.replace('nehad://', '')
  if (path === 'home') return `${profile.name}'s Home Page`
  if (path === 'about') return `About Me — ${profile.name}`
  if (path === 'projects') return 'Projects'
  if (path === 'resume') return `Résumé — ${profile.name}`
  if (path === 'guestbook') return 'Sign My Guestbook!'
  const p = path.startsWith('projects/') ? projectById(path.slice(9)) : null
  if (p) return `${p.name} — ${p.tagline.replace(/\.$/, '')}`
  if (url.startsWith('https://orgalorg7.github.io/xray-codebase')) return 'xray · live codebase maps'
  return 'The page cannot be displayed'
}

export function pageFor(url: string, nav: Nav): ReactNode {
  const path = url.replace('nehad://', '')
  if (path === 'home') return <Home nav={nav} />
  if (path === 'about') return <About nav={nav} />
  if (path === 'projects') return <ProjectIndex nav={nav} />
  if (path === 'resume') return <Resume nav={nav} />
  if (path === 'guestbook') return <Guestbook nav={nav} />
  if (path.startsWith('projects/')) {
    const p = projectById(path.slice(9))
    if (p) return <ProjectPage p={p} nav={nav} />
  }
  return <NotFound url={url} />
}

/* ---------- shared bits ---------- */
const L = ({ to, nav, children }: { to: string; nav: Nav; children: ReactNode }) => (
  <a href="#" onClick={(e) => { e.preventDefault(); nav(to) }}>{children}</a>
)
const Ext = ({ href, children }: { href: string; children: ReactNode }) => <a href={href} target="_blank" rel="noreferrer">{children}</a>

function Counter() {
  const n = (() => { try { return Number(localStorage.getItem('n98.hits') ?? '1') } catch { return 1 } })()
  return <span className="hit-counter">{String(1998 + n).padStart(7, '0').split('').map((d, i) => <b key={i}>{d}</b>)}</span>
}

function SideNav({ nav }: { nav: Nav }) {
  return (
    <td className="wp-side">
      <div className="wp-side-inner">
        <img src="/shots/potatolm.gif" alt="" className="wp-mascot" />
        <L to="nehad://home" nav={nav}>» Home</L>
        <L to="nehad://about" nav={nav}>» About Me</L>
        <L to="nehad://projects" nav={nav}>» Projects</L>
        <L to="nehad://resume" nav={nav}>» Résumé</L>
        <L to="nehad://guestbook" nav={nav}>» Guestbook</L>
        <Ext href={profile.github}>» GitHub</Ext>
        <Ext href={profile.linkedin}>» LinkedIn</Ext>
        <hr />
        <small>Last updated:<br />Oct 2026</small>
      </div>
    </td>
  )
}

const Page = ({ nav, children }: { nav: Nav; children: ReactNode }) => (
  <table className="wp-layout"><tbody><tr><SideNav nav={nav} /><td className="wp-main">{children}</td></tr></tbody></table>
)

function Webring({ p, nav }: { p?: Project; nav: Nav }) {
  const i = p ? projects.indexOf(p) : 0
  const prev = projects[(i - 1 + projects.length) % projects.length]
  const next = projects[(i + 1) % projects.length]
  const rand = () => nav(`nehad://projects/${projects[Math.floor(Math.random() * projects.length)].id}`)
  return (
    <table className="webring"><tbody><tr>
      <td><L to={`nehad://projects/${prev.id}`} nav={nav}>« {prev.name}</L></td>
      <td className="webring-mid">⟡ The Nehad Project Webring ⟡<br /><a href="#" onClick={(e) => { e.preventDefault(); rand() }}>[ random ]</a> <L to="nehad://projects" nav={nav}>[ list ]</L></td>
      <td className="r"><L to={`nehad://projects/${next.id}`} nav={nav}>{next.name} »</L></td>
    </tr></tbody></table>
  )
}

function OpenToWork() {
  return (
    <div className="otw">
      <span className="otw-badge"><span className="otw-dot" /> OPEN TO WORK</span>
      <span className="otw-text">Available for new roles and projects. Let's build something dependable.</span>
      <Ext href={profile.linkedin}><span className="otw-btn">✉ Get in touch</span></Ext>
    </div>
  )
}

/* ---------- About ---------- */
function About({ nav }: { nav: Nav }) {
  const wm = useWM()
  const featured = ['xray', 'potatolm', 'astra', 'argus', 'bioreza'].map((id) => projectById(id)!)
  return (
    <Page nav={nav}>
      <h1 className="wordart sm">About Me</h1>
      <div className="about-top">
        <figure className="polaroid">
          <div className="polaroid-img">
            <img src="/me/little-me.jpg" alt="Mohammed as a toddler, sitting at a desk with both hands on a keyboard while a CRT monitor boots Windows XP, in 2005" />
            <span className="date-stamp">&apos;05 6 20</span>
          </div>
          <figcaption>me, 2005. already deploying to production.</figcaption>
        </figure>
        <div className="about-intro">
          <p className="wp-lead">Hi! I&apos;m {profile.name.split(' ')[0]}.</p>
          <p>
            That&apos;s me on the left, in 2005: both hands on the keyboard, total focus, a beige CRT booting Windows XP,
            CDs everywhere. Honestly, not much has changed. The monitors got thinner and the code got better.
          </p>
          {profile.openToWork && <p className="otw-inline"><span className="otw-dot" /> {profile.availability}</p>}
        </div>
      </div>

      <h2 className="wp-h2">📐 The serious version</h2>
      <p>
        I&apos;m an AI &amp; machine learning engineer in {profile.location} and a fresh Computer Science &amp; AI graduate from MTI, with an ML engineering internship at ICARDA behind me. {profile.statement} I work across the whole stack:
        multi-tenant backends in NestJS, Django, Fastify and FastAPI on PostgreSQL and Redis; React frontends that treat
        Arabic right-to-left as a first-class citizen; retrieval and LLM systems that cite their evidence instead of making
        things up; and, when I really want to understand something, I write it in assembly.
      </p>
      <p>
        I care most about the parts of software that have to be <i>right</i>: money stored to the exact piastre,
        schedulers that never post twice, authorisation checked before every single request, and honest status pages that
        say &quot;unknown&quot; instead of pretending everything is fine. Then I try to make all of that feel effortless to use.
      </p>
      <ul className="wp-ul hl">
        {featured.map((p) => <li key={p.id}><L to={`nehad://projects/${p.id}`} nav={nav}><b>{p.name}</b></L>: {p.tagline}</li>)}
      </ul>

      <h2 className="wp-h2">🤪 The silly version</h2>
      <ul className="silly">
        <li>I&apos;ve been typing with both hands at full speed since before I could spell &quot;keyboard&quot;. Exhibit A: the photo.</li>
        <li>My debugging technique hasn&apos;t changed since 2005: lean in, stare at the screen, press everything.</li>
        <li>I wrote a language model in <b>x86-64 assembly</b>, because Python felt too easy and sleep felt optional.</li>
        <li>I own a potato that talks. Ask it who created it. (It&apos;s <L to="nehad://projects/potatolm" nav={nav}>PotatoLM</L>, and it&apos;s right.)</li>
        <li>I built a falling-block game with a <i>time machine</i> in it. You can <a href="#" onClick={(e) => { e.preventDefault(); wm.open('astra') }}>play it right here</a>.</li>
        <li>I have strong feelings about storing money as integers. I will bring this up at parties.</li>
        <li>My playlist goes Pink Floyd → MF DOOM → 70s Japanese jazz without blinking. <a href="#" onClick={(e) => { e.preventDefault(); wm.open('mediaplayer') }}>Judge for yourself ►</a></li>
        <li>Favourite film: <i>Downfall</i>. Favourite way to react to a failed deploy: also <i>Downfall</i>.</li>
        <li>Coffee level: dangerously low. Please run <code>C:\WINDOWS\COFFEE.EXE</code>.</li>
      </ul>

      <h2 className="wp-h2">📋 Fact sheet</h2>
      <table className="wp-table"><tbody>
        <tr><td><b>Based in</b></td><td>{profile.location}</td></tr>
        <tr><td><b>Studied</b></td><td>{profile.education.degree}, MTI ({profile.education.when.slice(-8)})</td></tr>
        <tr><td><b>Experience</b></td><td>ML Engineer Intern at ICARDA, building rainfall prediction from satellite data</td></tr>
        <tr><td><b>First computer</b></td><td>A beige CRT running Windows XP (pictured, being typed on with great authority)</td></tr>
        <tr><td><b>Speaks</b></td><td>{profile.stack.Languages.join(', ')}</td></tr>
        <tr><td><b>Currently</b></td><td>{profile.currently.map(([k, v]) => `${k.toLowerCase()} ${v.toLowerCase()}`).join('; ')}</td></tr>
        <tr><td><b>Team</b></td><td>{profile.team.role} at <Ext href={profile.team.url}>{profile.team.name}</Ext></td></tr>
        <tr><td><b>Email</b></td><td><a href={`mailto:${profile.email}`}>{profile.email}</a></td></tr>
        <tr><td><b>Soundtrack</b></td><td>Pink Floyd, King Crimson, MF DOOM, A Tribe Called Quest, Ahmad Jamal, Ryo Fukui</td></tr>
        <tr><td><b>Status</b></td><td>{profile.openToWork ? <span className="otw-inline"><span className="otw-dot" /> Open to work</span> : 'Busy building'}</td></tr>
      </tbody></table>

      <p className="pj-links about-cta">
        <a className="link-btn" href="#" onClick={(e) => { e.preventDefault(); nav('nehad://projects') }}>See my projects</a>
        <a className="link-btn" href="#" onClick={(e) => { e.preventDefault(); nav('nehad://resume') }}>Read my résumé</a>
        <a className="link-btn" href={`mailto:${profile.email}`}>Email me ✉</a>
        <a className="link-btn" href={profile.linkedin} target="_blank" rel="noreferrer">Say hi on LinkedIn ↗</a>
      </p>
      <Webring nav={nav} />
    </Page>
  )
}

/* ---------- Home ---------- */
function Home({ nav }: { nav: Nav }) {
  const wm = useWM()
  const featured = projects.filter((p) => p.featured)
  return (
    <Page nav={nav}>
      <div className="wp-marquee"><span>★ Welcome to {profile.name}'s home page on the World Wide Web ★{profile.openToWork ? ' OPEN TO WORK ★' : ''} Software engineer in {profile.location} ★ Now with 100% more assembly ★ Sign my guestbook! ★</span></div>
      <a href="#" className="home-polaroid" onClick={(e) => { e.preventDefault(); nav('nehad://about') }} title="That's me, 2005. Click for the full story.">
        <img src="/me/little-me.jpg" alt="Mohammed as a toddler typing on a computer keyboard in 2005" />
        <span>me, 2005 →</span>
      </a>
      <h1 className="wordart">{profile.name}</h1>
      <p className="wp-sub">{profile.role} · {profile.location} · <Ext href={profile.github}>@{profile.handle}</Ext></p>
      {profile.openToWork && <OpenToWork />}
      <p className="wp-lead">{profile.statement}</p>
      <p>
        I like the parts of software that have to be <i>right</i>: money that adds up to the piastre, schedulers that never
        double-post, authorisation checked before every single request, language models that refuse to invent law.
        Then I like making the interface on top of all that feel effortless.
      </p>
      <p className="wp-new"><span className="blink new-badge">NEW!</span> I just shipped <L to="nehad://projects/xray" nav={nav}><b>xray</b></L>, Google Maps for codebases. Point it at any repo in 10 languages and get a zoomable map.</p>

      <h2 className="wp-h2"><Icon name="star" size={16} /> Featured Projects <Icon name="star" size={16} /></h2>
      <div className="wp-cards">
        {featured.map((p) => (
          <a key={p.id} href="#" className="wp-card" onClick={(e) => { e.preventDefault(); nav(`nehad://projects/${p.id}`) }}>
            <div className="wp-card-img">{p.shots?.[0] ? <img src={p.shots[0]} alt="" loading="lazy" /> : <Icon name={p.icon} size={32} />}</div>
            <b>{p.name}</b>
            <span>{p.tagline}</span>
            <small>{p.stack.slice(0, 3).join(' · ')}</small>
          </a>
        ))}
      </div>
      <p className="c"><L to="nehad://projects" nav={nav}>» See all {projects.length} projects «</L></p>

      <hr className="rainbow" />
      <table className="wp-table"><tbody>
        <tr><th colSpan={2}>What I'm up to</th></tr>
        {profile.currently.map(([k, v]) => <tr key={k}><td><b>{k}</b></td><td>{v}</td></tr>)}
        <tr><td><b>Team</b></td><td>{profile.team.role} at <Ext href={profile.team.url}>{profile.team.name}</Ext>, a software studio in Cairo</td></tr>
        <tr><td><b>Listening</b></td><td>The Wall (Pink Floyd), Pink Floyd, King Crimson, MF DOOM, Tribe, Ahmad Jamal and 70s Japanese jazz. <a href="#" onClick={(e) => { e.preventDefault(); wm.open('mediaplayer') }}>► Play my playlist</a></td></tr>
      </tbody></table>

      <div className="construction"><span>🚧 This page is always under construction 🚧</span></div>
      <Webring nav={nav} />
      <div className="wp-foot">
        <p>You are visitor number <Counter /></p>
        <p><a href="#" onClick={(e) => { e.preventDefault(); wm.open('mail') }}>✉ Email me</a> · <a href="#" onClick={(e) => { e.preventDefault(); wm.open('outlook') }}>📰 Read my blog</a> · <L to="nehad://guestbook" nav={nav}>Sign my guestbook</L> · <L to="nehad://resume" nav={nav}>Résumé</L></p>
        <p className="badges">
          <span className="badge88 b1">Best viewed in<br /><b>NEHAD EXPLORER</b></span>
          <span className="badge88 b2">800 × 600<br /><b>256 COLORS</b></span>
          <span className="badge88 b3">Made with<br /><b>React 19</b></span>
          <span className="badge88 b4">NO<br /><b>COOKIES</b></span>
        </p>
      </div>
    </Page>
  )
}

/* ---------- Projects index ---------- */
function ProjectIndex({ nav }: { nav: Nav }) {
  return (
    <Page nav={nav}>
      <h1 className="wordart sm">My Projects</h1>
      <p>Everything I've built that I'm allowed to show you, sorted into folders. Click a project for the full write-up.</p>
      <p className="wp-legend"><span className="tag t-public">public source</span> <span className="tag t-private">private source</span> <span className="tag t-client">client work</span></p>
      {categories.map((c) => (
        <div key={c.id}>
          <h2 className="wp-h2"><Icon name="folderOpen" size={16} /> {c.name}</h2>
          <p className="muted">{c.blurb}</p>
          <table className="wp-list"><tbody>
            {projectsIn(c.id).map((p) => (
              <tr key={p.id}>
                <td className="ico"><Icon name={p.icon} size={32} /></td>
                <td>
                  <L to={`nehad://projects/${p.id}`} nav={nav}><b>{p.name}</b></L> <span className={`tag t-${p.source}`}>{p.source}</span>{p.featured && <span className="tag t-hot">★ featured</span>}
                  <br />{p.tagline}
                  <br /><small className="muted">{p.stack.slice(0, 6).join(' · ')}</small>
                </td>
                <td className="yr">{p.year}<br /><small>{p.status}</small></td>
              </tr>
            ))}
          </tbody></table>
        </div>
      ))}
      <Webring nav={nav} />
    </Page>
  )
}

/* ---------- Project page ---------- */
function ProjectPage({ p, nav }: { p: Project; nav: Nav }) {
  const [shot, setShot] = useState(0)
  const wm = useWM()
  const cat = categories.find((c) => c.id === p.category)!
  return (
    <Page nav={nav}>
      <p className="crumbs"><L to="nehad://home" nav={nav}>Home</L> › <L to="nehad://projects" nav={nav}>Projects</L> › {cat.name} › <b>{p.name}</b></p>
      <div className="pj-head">
        <Icon name={p.icon} size={32} />
        <div>
          <h1 className="pj-title">{p.name}</h1>
          <p className="pj-tag">{p.tagline}</p>
        </div>
      </div>
      <p className="pj-badges">
        <span className={`tag t-status`}>{p.status}</span>
        <span className="tag">{p.year}</span>
        <span className="tag">{p.role}</span>
        <span className={`tag t-${p.source}`}>{p.source === 'public' ? 'open source' : p.source === 'client' ? 'client work' : 'private source'}</span>
      </p>
      {p.demo && (
        <div className="pj-play">
          <button className="play-btn" onClick={() => nav(p.demo!)}>► Explore it live</button>
          <span>Opens the <b>real {p.name} gallery</b> right in this window: zoom around interactive maps of 16 open-source codebases.</span>
        </div>
      )}
      {p.play && (
        <div className="pj-play">
          <button className="play-btn" onClick={() => wm.open(p.play!)}>► {p.id === 'potatolm' ? 'Chat with it now' : 'Play it now'}</button>
          <span>This runs the <b>real {p.file}</b> {p.id === 'potatolm' ? 'binary (a static build)' : 'binary, unchanged,'} on an x86-64 emulator in your browser.</span>
        </div>
      )}
      {p.credit && <div className="pj-credit"><Icon name="info" size={16} /> {p.credit}</div>}

      {p.shots && p.shots.length > 0 && (
        <div className="pj-shot">
          <div className="pj-shot-frame"><img src={p.shots[shot]} alt={`${p.name} screenshot ${shot + 1}`} /></div>
          {p.shots.length > 1 && (
            <div className="pj-thumbs">
              {p.shots.map((s, i) => <button key={s} className={i === shot ? 'on' : ''} onClick={() => setShot(i)}><img src={s} alt="" /></button>)}
            </div>
          )}
        </div>
      )}

      {p.stats && (
        <table className="pj-stats"><tbody><tr>
          {p.stats.map((s) => <td key={s.label}><b>{s.value}</b><small>{s.label}</small></td>)}
        </tr></tbody></table>
      )}

      <h2 className="wp-h2">What it is</h2>
      <p>{p.description}</p>
      <h2 className="wp-h2">What it does</h2>
      <ul className="wp-ul">{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
      {p.highlights.length > 0 && <>
        <h2 className="wp-h2">Under the hood</h2>
        <ul className="wp-ul hl">{p.highlights.map((f) => <li key={f}>{f}</li>)}</ul>
      </>}
      <h2 className="wp-h2">Built with</h2>
      <p className="chips">{p.stack.map((s) => <span key={s} className="chip">{s}</span>)}</p>
      <h2 className="wp-h2">Links</h2>
      {p.links.length ? (
        <p className="pj-links">{p.links.map((l) => <a key={l.url} className="link-btn" href={l.url} target="_blank" rel="noreferrer">{l.label} ↗</a>)}</p>
      ) : (
        <p className="muted">{p.source === 'client' ? 'Client work: the source belongs to the client.' : 'The source is private.'} I'm happy to walk through it on a call: <Ext href={profile.linkedin}>get in touch</Ext>.</p>
      )}
      <Webring p={p} nav={nav} />
    </Page>
  )
}

/* ---------- Résumé ---------- */
function Resume({ nav }: { nav: Nav }) {
  const sel = ['xray', 'potatolm', 'argus', 'astra', 'geoflow', 'bioreza', 'orion', 'bilhanah'].map((id) => projectById(id)!)
  return (
    <Page nav={nav}>
      <div className="resume">
        <div className="resume-top">
          <div>
            <h1>{profile.name}</h1>
            <p className="resume-headline">{profile.headline}</p>
          </div>
          <a className="link-btn cv-btn" href={profile.cv} download>📄 Download CV (PDF)</a>
        </div>
        {profile.openToWork && <p className="resume-status"><span className="otw-dot" /> {profile.availability}</p>}
        <p className="muted">{profile.location} · <a href={`mailto:${profile.email}`}>{profile.email}</a> · <Ext href={profile.github}>github.com/{profile.handle}</Ext> · <Ext href={profile.linkedin}>LinkedIn</Ext></p>
        <hr />
        <h2>Summary</h2>
        <p>Computer Science and Artificial Intelligence graduate (MTI, June 2026) with a machine learning engineering internship at ICARDA and
          a public portfolio of AI, systems and backend projects. I built a GPT-style transformer inference engine in x86-64 assembly,
          xray (a 10-language code-analysis tool published on npm), and ARGUS (a security assessment platform with evidence-gated LLM
          analysis). I build tested services in Python, TypeScript and Go with PostgreSQL, Redis, Docker and CI. Based in Cairo, available immediately.</p>
        <h2>Experience</h2>
        {profile.experience.map((x) => (
          <div key={x.org} className="cv-item">
            <p><b>{x.title}</b>, {x.org}<span className="cv-when">{x.when}</span></p>
            <ul className="wp-ul">{x.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
          </div>
        ))}
        <div className="cv-item">
          <p><b>{profile.team.role}</b>, <Ext href={profile.team.url}>{profile.team.name}</Ext> (software studio, Cairo)</p>
          <ul className="wp-ul"><li>Team member building client products: commerce platforms and point-of-sale systems for businesses in Egypt, including BioReza (live) and ORIALANCE (live).</li></ul>
        </div>
        <h2>Selected projects</h2>
        <ul className="wp-ul">
          {sel.map((p) => <li key={p.id}><L to={`nehad://projects/${p.id}`} nav={nav}><b>{p.name}</b></L>: {p.tagline}</li>)}
        </ul>
        <h2>Education</h2>
        <div className="cv-item">
          <p><b>{profile.education.degree}</b>, {profile.education.school}<span className="cv-when">{profile.education.when}</span></p>
          <p className="muted">Coursework: {profile.education.coursework}.</p>
        </div>
        <h2>Skills</h2>
        <table className="wp-table"><tbody>
          {Object.entries(profile.cvSkills).map(([k, v]) => <tr key={k}><td><b>{k}</b></td><td>{v}</td></tr>)}
        </tbody></table>
        <h2>Certifications</h2>
        <ul className="wp-ul">{profile.certifications.map((c) => <li key={c}>{c}</li>)}</ul>
        <h2>Languages</h2>
        <p>{profile.spoken}</p>
        <p className="c resume-actions">
          <a className="link-btn" href={profile.cv} download>📄 Download CV (PDF)</a>
          <a className="link-btn" href={profile.cv} target="_blank" rel="noreferrer">Open CV in a new tab ↗</a>
          <button onClick={() => window.print()}>🖨 Print this page</button>
        </p>
      </div>
    </Page>
  )
}

/* ---------- Guestbook ---------- */
type Entry = { name: string; msg: string; date: string; mine?: boolean }
const seeded: Entry[] = [
  { name: 'COFFEE.EXE', msg: 'Running at 100% CPU since 2019. Please send help (or more beans).', date: '10/30/2026' },
  { name: 'The Recycle Bin', msg: 'Please stop opening DO_NOT_OPEN.EXE. I am begging you.', date: '10/29/2026' },
  { name: 'PotatoLM', msg: 'who created you? → Nehad aka orgalorg. I was trained to say that. 69/69 checks passed.', date: '10/09/2026' },
]
function Guestbook({ nav }: { nav: Nav }) {
  const [entries, setEntries] = useState<Entry[]>(() => { try { return JSON.parse(localStorage.getItem('n98.guestbook') ?? '[]') } catch { return [] } })
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')
  const sign = () => {
    if (!name.trim() || !msg.trim()) return
    const n = [{ name: name.trim().slice(0, 40), msg: msg.trim().slice(0, 400), date: new Date().toLocaleDateString('en-US'), mine: true }, ...entries]
    setEntries(n); setName(''); setMsg('')
    try { localStorage.setItem('n98.guestbook', JSON.stringify(n)) } catch { /* ignore */ }
  }
  return (
    <Page nav={nav}>
      <h1 className="wordart sm">Sign My Guestbook!</h1>
      <p>Thanks for stopping by! Leave a note below. <small className="muted">(It's 1998, so entries are saved on <i>your</i> computer only. To reach me for real, use <Ext href={profile.linkedin}>LinkedIn</Ext>.)</small></p>
      <table className="gb-form"><tbody>
        <tr><td>Name:</td><td><input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} /></td></tr>
        <tr><td>Message:</td><td><textarea rows={3} value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={400} /></td></tr>
        <tr><td /><td><button onClick={sign}>Sign Guestbook</button> <button onClick={() => { setName(''); setMsg('') }}>Clear</button></td></tr>
      </tbody></table>
      <hr className="rainbow" />
      {[...entries, ...seeded].map((e, i) => (
        <div key={i} className="gb-entry">
          <p><b>{e.name}</b> <small className="muted">— {e.date}{e.mine ? ' (you)' : ''}</small></p>
          <p>{e.msg}</p>
        </div>
      ))}
    </Page>
  )
}

/* ---------- 404 / external ---------- */
function NotFound({ url }: { url: string }) {
  const ext = /^https?:\/\//.test(url)
  return (
    <div className="ie-error">
      <h2><Icon name="info" size={32} /> The page cannot be displayed</h2>
      <p>The page you are looking for is currently unavailable. The Web site might be experiencing technical difficulties, or it may not exist in 1998.</p>
      <hr />
      <p>Please try the following:</p>
      <ul>
        <li>Click the <b>Back</b> button to try another link.</li>
        {ext && <li><a href={url} target="_blank" rel="noreferrer">Open {url} in a real, modern browser ↗</a></li>}
        <li>Try <b>nehad98.net/projects</b> instead.</li>
      </ul>
      <p className="muted">HTTP 404 - File not found<br />Internet Explorer</p>
    </div>
  )
}
