import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, Check, Github, Globe2, HeartHandshake, Mail, RotateCcw, Sparkles, Sun, Waypoints } from 'lucide-react'
import ProfileFields from './components/ProfileFields'
import { getMessages } from './i18n'
import { demoPartnerProfile, demoProfile, localInsightEngine } from './lib/engine'
import BondsView from './views/BondsView'
import TimelineView from './views/TimelineView'
import TodayView from './views/TodayView'
import type { Gender, Locale, ProfileInput, ReadingMode, RelationshipType } from './types'

const validModes: ReadingMode[] = ['today', 'timeline', 'bonds']
const validGenders: Gender[] = ['female', 'male', 'other']
const validRelationships: RelationshipType[] = ['partner', 'friend', 'family', 'coworker']

const initialLocale = (): Locale => {
  const value = new URLSearchParams(window.location.search).get('lang')
  if (value === 'zh' || value === 'en') return value
  const configured = import.meta.env.VITE_DEFAULT_LOCALE
  if (configured === 'zh' || configured === 'en') return configured
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

const initialMode = (): ReadingMode => {
  const value = new URLSearchParams(window.location.search).get('mode') as ReadingMode | null
  return value && validModes.includes(value) ? value : 'timeline'
}

const initialRelationship = (): RelationshipType => {
  const value = new URLSearchParams(window.location.search).get('relation') as RelationshipType | null
  return value && validRelationships.includes(value) ? value : 'partner'
}

const decodeProfile = (prefix = ''): ProfileInput | null => {
  const params = new URLSearchParams(window.location.search)
  const birthDate = params.get(`${prefix}date`)
  const birthTime = params.get(`${prefix}time`)
  const gender = params.get(`${prefix}gender`) as Gender | null
  if (!birthDate || !birthTime || !gender || !validGenders.includes(gender)) return null
  return { name: params.get(`${prefix}name`) ?? '', birthDate, birthTime, gender }
}

function App() {
  const sharedPrimary = useMemo(() => decodeProfile(), [])
  const sharedSecondary = useMemo(() => decodeProfile('b_'), [])
  const [locale, setLocale] = useState<Locale>(initialLocale)
  const [mode, setMode] = useState<ReadingMode>(initialMode)
  const [primary, setPrimary] = useState<ProfileInput>(sharedPrimary ?? demoProfile)
  const [secondary, setSecondary] = useState<ProfileInput>(sharedSecondary ?? demoPartnerProfile)
  const [primaryDraft, setPrimaryDraft] = useState<ProfileInput>(sharedPrimary ?? demoProfile)
  const [secondaryDraft, setSecondaryDraft] = useState<ProfileInput>(sharedSecondary ?? demoPartnerProfile)
  const [relationshipType, setRelationshipType] = useState<RelationshipType>(initialRelationship)
  const [isDemo, setIsDemo] = useState(!sharedPrimary)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const t = getMessages(locale)
  const repositoryUrl = (import.meta.env.VITE_REPOSITORY_URL as string | undefined) ?? 'https://github.com/wuxiumu/life-k-line'
  const result = useMemo(() => localInsightEngine.generate({ mode, locale, primary, secondary: mode === 'bonds' ? secondary : undefined, relationshipType }), [mode, locale, primary, secondary, relationshipType])

  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en'
    document.title = locale === 'zh' ? `${t[mode]} | Life K-Line` : `Life K-Line ${t[mode]}`
  }, [locale, mode, t])

  const updateUrl = (nextMode = mode, nextLocale = locale) => {
    const url = new URL(window.location.href)
    url.searchParams.set('mode', nextMode)
    url.searchParams.set('lang', nextLocale)
    window.history.replaceState({}, '', url)
  }

  const switchMode = (next: ReadingMode) => {
    setMode(next)
    setCopied(false)
    updateUrl(next, locale)
  }

  const switchLocale = (next: Locale) => {
    setLocale(next)
    updateUrl(mode, next)
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const primaryValid = primaryDraft.birthDate && primaryDraft.birthTime
    const secondaryValid = mode !== 'bonds' || (secondaryDraft.birthDate && secondaryDraft.birthTime)
    if (!primaryValid || !secondaryValid) {
      setError(t.required)
      return
    }
    setError('')
    setPrimary(primaryDraft)
    setSecondary(secondaryDraft)
    setIsDemo(false)
    requestAnimationFrame(() => document.getElementById('result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const restoreDemo = () => {
    setPrimaryDraft(demoProfile)
    setSecondaryDraft(demoPartnerProfile)
    setPrimary(demoProfile)
    setSecondary(demoPartnerProfile)
    setRelationshipType('partner')
    setIsDemo(true)
    setError('')
  }

  const addProfileParams = (url: URL, profile: ProfileInput, prefix = '') => {
    url.searchParams.set(`${prefix}date`, profile.birthDate)
    url.searchParams.set(`${prefix}time`, profile.birthTime)
    url.searchParams.set(`${prefix}gender`, profile.gender)
    if (profile.name) url.searchParams.set(`${prefix}name`, profile.name)
  }

  const share = async () => {
    const url = new URL(window.location.origin + window.location.pathname)
    url.searchParams.set('lang', locale)
    url.searchParams.set('mode', mode)
    addProfileParams(url, primary)
    if (mode === 'bonds') {
      addProfileParams(url, secondary, 'b_')
      url.searchParams.set('relation', relationshipType)
    }
    const data = { title: `Life K-Line · ${t[mode]}`, text: result.headline.label, url: url.toString() }
    try {
      if (navigator.share) await navigator.share(data)
      else {
        await navigator.clipboard.writeText(data.url)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 2200)
      }
    } catch (shareError) {
      if ((shareError as Error).name !== 'AbortError') setError(String(shareError))
    }
  }

  const hero = {
    today: { tag: t.todayTag, title: t.todayHero, body: t.todayBody },
    timeline: { tag: t.timelineTag, title: t.timelineHero, body: t.timelineBody },
    bonds: { tag: t.bondsTag, title: t.bondsHero, body: t.bondsBody },
  }[mode]
  const displayName = isDemo ? t.personA : primary.name || t.personA
  const viewProps = { result, displayName, copied, onShare: share, messages: t }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Life K-Line home"><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span><strong>Life K-Line</strong><small>{t.brandSub}</small></span></a>
        <nav className="mode-nav" aria-label="Mode">
          <button className={mode === 'today' ? 'active' : ''} onClick={() => switchMode('today')}><Sun size={17} /><span>{t.today}</span></button>
          <button className={mode === 'timeline' ? 'active' : ''} onClick={() => switchMode('timeline')}><Waypoints size={17} /><span>{t.timeline}</span></button>
          <button className={mode === 'bonds' ? 'active' : ''} onClick={() => switchMode('bonds')}><HeartHandshake size={17} /><span>{t.bonds}</span></button>
        </nav>
        <div className="top-actions"><a className="icon-link" href={repositoryUrl} target="_blank" rel="noreferrer" aria-label={t.openSource} title={t.openSource}><Github size={19} /></a><div className="locale-switch" aria-label="Language"><Globe2 size={17} /><button className={locale === 'zh' ? 'active' : ''} onClick={() => switchLocale('zh')}>中</button><span>/</span><button className={locale === 'en' ? 'active' : ''} onClick={() => switchLocale('en')}>EN</button></div></div>
      </header>

      <main>
        <section className="intro-band"><div className="intro-copy"><p className="eyebrow"><Sparkles size={15} />{hero.tag}</p><h1>{hero.title}</h1><p className="intro-body">{hero.body}</p></div><div className="live-stat"><span>{t.currentRhythm}</span><strong>{result.headline.score}</strong><small>/ 100</small></div></section>
        <section className="workspace">
          <aside className="input-panel">
            <div className="mode-line"><span className={isDemo ? 'mode-badge demo' : 'mode-badge'}>{isDemo ? t.demoBadge : t.customBadge}</span><p>{isDemo ? t.demoHint : t.privacy}</p></div>
            <form onSubmit={submit}>
              <section className="form-section"><h2>{t.primaryProfile}</h2><ProfileFields profile={primaryDraft} onChange={setPrimaryDraft} messages={t} /></section>
              {mode === 'bonds' && <section className="form-section secondary-form"><h2>{t.secondaryProfile}</h2><ProfileFields profile={secondaryDraft} onChange={setSecondaryDraft} messages={t} secondary /><fieldset><legend>{t.relationshipType}</legend><div className="relationship-switch">{(['partner', 'friend', 'family', 'coworker'] as RelationshipType[]).map((type) => <button type="button" key={type} className={relationshipType === type ? 'selected' : ''} onClick={() => setRelationshipType(type)}>{t[type]}</button>)}</div></fieldset></section>}
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="primary-action" type="submit">{t.generate}<ArrowUpRight size={19} /></button>
              {!isDemo && <button className="text-action" type="button" onClick={restoreDemo}><RotateCcw size={15} />{t.resetDemo}</button>}
            </form>
            <p className="privacy-note"><Check size={14} />{t.privacy}</p>
          </aside>
          {mode === 'today' && <TodayView {...viewProps} />}
          {mode === 'timeline' && <TimelineView {...viewProps} />}
          {mode === 'bonds' && <BondsView {...viewProps} />}
        </section>
      </main>

      <footer><div><strong>Life K-Line</strong><span>{t.footerLine}</span></div><p>{t.disclaimer}</p><nav><a href={repositoryUrl} target="_blank" rel="noreferrer"><Github size={15} />Apache-2.0</a><a href="mailto:wuxiumu@163.com"><Mail size={15} />{t.contact}</a></nav></footer>
    </div>
  )
}

export default App
