import type { Messages } from '../i18n'
import type { ReadingResultV1 } from '../types'
import DimensionGrid from '../components/DimensionGrid'
import InsightSections from '../components/InsightSections'
import ResultHeader from '../components/ResultHeader'
import TrendChart from '../components/TrendChart'

interface ViewProps { result: ReadingResultV1; displayName: string; copied: boolean; onShare: () => void; messages: Messages }

export default function BondsView({ result, displayName, copied, onShare, messages: t }: ViewProps) {
  const secondaryName = result.subject.secondary?.name || t.personB
  return (
    <section className="result-panel" id="result">
      <ResultHeader result={result} displayName={displayName} copied={copied} onShare={onShare} messages={t} />
      <div className="bond-pair"><div><span>{t.personA}</span><strong>{displayName}</strong><small>{result.subject.pillars.join(' · ')}</small></div><i>×</i><div><span>{t.personB}</span><strong>{secondaryName}</strong><small>{result.subject.secondaryPillars?.join(' · ')}</small></div></div>
      <section className="content-section"><div className="section-label">{t.relationOverview}</div><DimensionGrid dimensions={result.dimensions} messages={t} /></section>
      <section className="content-section chart-section"><div className="section-label">{t.nextTwelve}</div><TrendChart data={result.series[0].points} ariaLabel={t.nextTwelve} /></section>
      <InsightSections result={result} messages={t} />
    </section>
  )
}
