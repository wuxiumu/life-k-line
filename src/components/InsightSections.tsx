import type { Messages } from '../i18n'
import type { ReadingResultV1 } from '../types'

export default function InsightSections({ result, messages: t }: { result: ReadingResultV1; messages: Messages }) {
  return (
    <>
      <section className="content-section"><div className="section-label">{t.keyMoments}</div><div className="moment-list">{result.moments.map((moment) => <article key={`${moment.period}-${moment.title}`} className={`moment ${moment.tone}`}><span>{moment.period}</span><strong>{moment.title}</strong><small>{moment.score}/100</small><p>{moment.summary}</p></article>)}</div></section>
      <section className="content-split">
        <div><div className="section-label">{t.insights}</div><div className="stack-list">{result.insights.map((item) => <article key={item.id}><strong>{item.title}</strong><p>{item.body}</p></article>)}</div></div>
        <div><div className="section-label">{t.actions}</div><div className="stack-list">{result.actions.map((item) => <article key={item.id} className={item.tone}><strong>{item.label}</strong><p>{item.body}</p></article>)}</div></div>
      </section>
      <section className="evidence-row"><div className="section-label">{t.basis}</div>{result.evidence.map((item) => <span key={item.label}><strong>{item.label}</strong>{item.value}</span>)}</section>
    </>
  )
}
