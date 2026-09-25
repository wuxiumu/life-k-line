import { Share2 } from 'lucide-react'
import type { Messages } from '../i18n'
import type { ReadingResultV1 } from '../types'

interface ResultHeaderProps { result: ReadingResultV1; displayName: string; copied: boolean; onShare: () => void; messages: Messages }

export default function ResultHeader({ result, displayName, copied, onShare, messages: t }: ResultHeaderProps) {
  const secondary = result.subject.secondary?.name
  return (
    <div className="result-heading">
      <div>
        <div className="result-kicker"><span>{t.resultFor}: {displayName}{secondary ? ` × ${secondary}` : ''}</span><span>{result.subject.pillars.join(' · ')}</span></div>
        <div className="headline-row"><div className="headline-score">{result.headline.score}<small>/100</small></div><div><h2>{result.headline.label}</h2><p>{result.headline.summary}</p></div></div>
      </div>
      <button className="share-button" onClick={onShare}><Share2 size={17} />{copied ? t.copied : t.share}</button>
    </div>
  )
}
