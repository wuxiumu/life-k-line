export type Locale = 'zh' | 'en'
export type Gender = 'female' | 'male' | 'other'
export type ReadingMode = 'today' | 'timeline' | 'bonds'
export type RelationshipType = 'partner' | 'friend' | 'family' | 'coworker'
export type TimelineRange = '18y' | '10y' | '1y'
export type Tone = 'positive' | 'neutral' | 'caution'

export type LifeDimensionKey = 'career' | 'wealth' | 'relationships' | 'wellbeing' | 'growth' | 'environment'
export type BondDimensionKey = 'chemistry' | 'communication' | 'trust' | 'rhythm' | 'sharedGrowth' | 'boundaries'
export type DimensionKey = LifeDimensionKey | BondDimensionKey

export interface ProfileInput {
  name: string
  birthDate: string
  birthTime: string
  gender: Gender
}

export interface DimensionScore {
  key: DimensionKey
  score: number
  delta?: number
  summary: string
}

export interface TimePoint {
  period: string
  label: string
  score: number
  age?: number
  dimensions?: Partial<Record<DimensionKey, number>>
}

export interface TimeSeries {
  id: TimelineRange | '7d' | '12m'
  label: string
  points: TimePoint[]
}

export interface KeyMoment {
  period: string
  score: number
  tone: Tone
  title: string
  summary: string
}

export interface InsightBlock {
  id: string
  title: string
  body: string
  tone: Tone
}

export interface ActionItem {
  id: string
  label: string
  body: string
  tone: Tone
}

export interface EvidenceItem {
  label: string
  value: string
}

export interface ReadingResultV1 {
  schemaVersion: '1.0'
  mode: ReadingMode
  engine: { id: string; version: string; locale: Locale }
  subject: {
    primary: ProfileInput
    secondary?: ProfileInput
    relationshipType?: RelationshipType
    pillars: string[]
    secondaryPillars?: string[]
  }
  headline: {
    score: number
    label: string
    summary: string
    confidence: 'medium'
  }
  dimensions: DimensionScore[]
  series: TimeSeries[]
  moments: KeyMoment[]
  insights: InsightBlock[]
  actions: ActionItem[]
  evidence: EvidenceItem[]
  generatedAt: string
}

export interface ReadingContext {
  mode: ReadingMode
  locale: Locale
  primary: ProfileInput
  secondary?: ProfileInput
  relationshipType?: RelationshipType
}

export interface ReadingModePlugin {
  readonly id: ReadingMode
  generate(context: ReadingContext): ReadingResultV1
}

export interface InsightEngine {
  readonly id: string
  generate(context: ReadingContext): ReadingResultV1
}
