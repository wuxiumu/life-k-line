import { Lightbulb } from 'lucide-react'
import type { Messages } from '../i18n'
import type { ReadingResultV1 } from '../types'
import DimensionGrid from '../components/DimensionGrid'
import InsightSections from '../components/InsightSections'
import ResultHeader from '../components/ResultHeader'
import TrendChart from '../components/TrendChart'

interface ViewProps { result: ReadingResultV1; displayName: string; copied: boolean; onShare: () => void; messages: Messages }

export default function TodayView({ result, displayName, copied, onShare, messages: t }: ViewProps) {
  const series = result.series[0]
  return (
    <section className="result-panel" id="result">
      <ResultHeader result={result} displayName={displayName} copied={copied} onShare={onShare} messages={t} />
      <section className="content-section chart-section"><div className="section-title-row"><div><span className="section-label">{t.sevenDay}</span><strong>{series.label}</strong></div></div><TrendChart data={series.points} currentPeriod={new Date().toISOString().slice(0, 10)} ariaLabel={t.sevenDay} /></section>
      <section className="content-section"><div className="section-label">{t.dimensions}</div><DimensionGrid dimensions={result.dimensions} messages={t} /></section>
      <aside className="reflection"><Lightbulb size={21} /><div><strong>{t.todayQuestion}</strong><p>{t.todayQuestionBody}</p></div></aside>
      <InsightSections result={result} messages={t} />
    </section>
  )
}
