import { useState } from 'react'
import type { Messages } from '../i18n'
import type { DimensionKey, ReadingResultV1, TimelineRange } from '../types'
import DimensionGrid from '../components/DimensionGrid'
import InsightSections from '../components/InsightSections'
import ResultHeader from '../components/ResultHeader'
import TrendChart from '../components/TrendChart'

interface ViewProps { result: ReadingResultV1; displayName: string; copied: boolean; onShare: () => void; messages: Messages }

export default function TimelineView({ result, displayName, copied, onShare, messages: t }: ViewProps) {
  const [range, setRange] = useState<TimelineRange>('18y')
  const [dimension, setDimension] = useState<DimensionKey | 'overall'>('overall')
  const series = result.series.find((item) => item.id === range) ?? result.series[0]
  const currentPeriod = range === '1y' ? `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}` : String(new Date().getFullYear())
  const rangeLabels = { '18y': t.range18y, '10y': t.range10y, '1y': t.range1y }
  return (
    <section className="result-panel" id="result">
      <ResultHeader result={result} displayName={displayName} copied={copied} onShare={onShare} messages={t} />
      <section className="content-section chart-section">
        <div className="section-title-row"><div className="range-switch">{(['18y', '10y', '1y'] as TimelineRange[]).map((item) => <button key={item} className={range === item ? 'active' : ''} onClick={() => setRange(item)}>{rangeLabels[item]}</button>)}</div><label className="dimension-select"><span>{t.dimensionView}</span><select value={dimension} onChange={(event) => setDimension(event.target.value as DimensionKey | 'overall')}><option value="overall">{t.overall}</option>{result.dimensions.map((item) => <option key={item.key} value={item.key}>{t[item.key]}</option>)}</select></label></div>
        <TrendChart data={series.points} selectedDimension={dimension} currentPeriod={currentPeriod} ariaLabel={series.label} />
      </section>
      <section className="content-section"><div className="section-label">{t.allDimensions}</div><DimensionGrid dimensions={result.dimensions} messages={t} /></section>
      <section className="content-section matrix-section"><div className="section-label">{t.dataMatrix}</div><div className="matrix-wrap"><table><thead><tr><th>{range === '1y' ? t.change : t.current}</th><th>{t.overall}</th>{result.dimensions.map((item) => <th key={item.key}>{t[item.key]}</th>)}</tr></thead><tbody>{series.points.map((point) => <tr key={point.period} className={point.period === currentPeriod ? 'current-row' : ''}><td><strong>{point.label}</strong>{point.age !== undefined && <small>{point.age} {t.age}</small>}</td><td>{point.score}</td>{result.dimensions.map((item) => <td key={item.key}><i className="heat" style={{ opacity: Math.max(.18, (point.dimensions?.[item.key] ?? 50) / 100) }} />{point.dimensions?.[item.key] ?? '-'}</td>)}</tr>)}</tbody></table></div></section>
      <InsightSections result={result} messages={t} />
    </section>
  )
}
