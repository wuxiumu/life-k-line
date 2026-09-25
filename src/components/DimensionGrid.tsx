import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react'
import type { Messages } from '../i18n'
import type { DimensionScore } from '../types'

export default function DimensionGrid({ dimensions, messages: t }: { dimensions: DimensionScore[]; messages: Messages }) {
  return (
    <div className="dimension-grid">
      {dimensions.map((dimension) => {
        const delta = dimension.delta ?? 0
        const TrendIcon = delta > 2 ? ArrowUp : delta < -2 ? ArrowDown : ArrowRight
        return (
          <article className="dimension" key={dimension.key}>
            <div className="dimension-top"><span>{t[dimension.key]}</span><strong>{dimension.score}</strong></div>
            <div className="meter"><i style={{ width: `${dimension.score}%` }} /></div>
            <div className={`delta ${delta > 2 ? 'up' : delta < -2 ? 'down' : ''}`}><TrendIcon size={13} />{delta > 0 ? '+' : ''}{delta}</div>
            <p>{dimension.summary}</p>
          </article>
        )
      })}
    </div>
  )
}
