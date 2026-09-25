import { Solar } from 'lunar-javascript'
import type {
  BondDimensionKey,
  DimensionKey,
  DimensionScore,
  InsightEngine,
  LifeDimensionKey,
  Locale,
  ProfileInput,
  ReadingContext,
  ReadingMode,
  ReadingResultV1,
  TimePoint,
} from '../types'

const lifeKeys: LifeDimensionKey[] = ['career', 'wealth', 'relationships', 'wellbeing', 'growth', 'environment']
const bondKeys: BondDimensionKey[] = ['chemistry', 'communication', 'trust', 'rhythm', 'sharedGrowth', 'boundaries']
const clamp = (value: number, min = 18, max = 94) => Math.min(max, Math.max(min, Math.round(value)))

const hashText = (source: string) => {
  let hash = 2166136261
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash)
}

const hashProfile = (profile: ProfileInput) => hashText(`${profile.birthDate}|${profile.birthTime}|${profile.gender}|${profile.name}`)

const getPillars = (profile: ProfileInput) => {
  try {
    const [year, month, day] = profile.birthDate.split('-').map(Number)
    const [hour, minute] = profile.birthTime.split(':').map(Number)
    const eightChar = Solar.fromYmdHms(year, month, day, hour, minute, 0).getLunar().getEightChar()
    return [eightChar.getYear(), eightChar.getMonth(), eightChar.getDay(), eightChar.getTime()]
  } catch {
    return ['--', '--', '--', '--']
  }
}

const scoreFor = (seed: number, index: number, base = 60) => {
  const longWave = Math.sin(index * 0.73 + (seed % 628) / 100) * 16
  const shortWave = Math.cos(index * 1.37 + ((seed >> 3) % 628) / 100) * 8
  return clamp(base + longWave + shortWave)
}

const dimensionMap = (seed: number, index: number, keys: DimensionKey[]) => Object.fromEntries(
  keys.map((key, keyIndex) => [key, clamp(scoreFor(seed + keyIndex * 977, index + keyIndex, 61))]),
) as Record<DimensionKey, number>

const dimensionCopy = (score: number, locale: Locale) => {
  const state = score >= 72 ? 'high' : score >= 48 ? 'mid' : 'low'
  const copy = {
    zh: { high: '动力较强，适合主动推进。', mid: '节奏平稳，适合持续积累。', low: '进入调整窗口，优先修复基础。' },
    en: { high: 'Strong momentum. A good window for deliberate action.', mid: 'Steady rhythm. Favor consistent, focused progress.', low: 'A reset window. Protect energy and repair the foundation.' },
  }
  return copy[locale][state]
}

const makeDimensions = (seed: number, currentIndex: number, keys: DimensionKey[], locale: Locale): DimensionScore[] => {
  const current = dimensionMap(seed, currentIndex, keys)
  const previous = dimensionMap(seed, currentIndex - 1, keys)
  return keys.map((key) => ({ key, score: current[key], delta: current[key] - previous[key], summary: dimensionCopy(current[key], locale) }))
}

const formatDate = (date: Date) => date.toISOString().slice(0, 10)
const monthLabel = (date: Date, locale: Locale) => locale === 'zh' ? `${date.getMonth() + 1}月` : date.toLocaleDateString('en-US', { month: 'short' })
const dayLabel = (date: Date, locale: Locale) => locale === 'zh' ? `${date.getMonth() + 1}/${date.getDate()}` : date.toLocaleDateString('en-US', { weekday: 'short' })

const dimensionName = (key: DimensionKey, locale: Locale) => {
  const names: Record<DimensionKey, [string, string]> = {
    career: ['事业', 'career'], wealth: ['财富', 'wealth'], relationships: ['关系', 'relationships'],
    wellbeing: ['身心', 'wellbeing'], growth: ['成长', 'growth'], environment: ['环境', 'environment'],
    chemistry: ['默契', 'chemistry'], communication: ['沟通', 'communication'], trust: ['信任', 'trust'],
    rhythm: ['节奏', 'rhythm'], sharedGrowth: ['共同成长', 'shared growth'], boundaries: ['边界', 'boundaries'],
  }
  return names[key][locale === 'zh' ? 0 : 1]
}

const baseResult = (context: ReadingContext, mode: ReadingMode): Omit<ReadingResultV1, 'headline' | 'dimensions' | 'series' | 'moments' | 'insights' | 'actions'> => ({
  schemaVersion: '1.0',
  mode,
  engine: { id: 'local-deterministic', version: '2.0.0', locale: context.locale },
  subject: {
    primary: context.primary,
    secondary: context.secondary,
    relationshipType: context.relationshipType,
    pillars: getPillars(context.primary),
    secondaryPillars: context.secondary ? getPillars(context.secondary) : undefined,
  },
  evidence: [
    { label: context.locale === 'zh' ? '计算方式' : 'Method', value: context.locale === 'zh' ? '本地确定性引擎' : 'Local deterministic engine' },
    { label: context.locale === 'zh' ? '隐私' : 'Privacy', value: context.locale === 'zh' ? '浏览器内完成' : 'Processed in your browser' },
  ],
  generatedAt: new Date().toISOString(),
})

const todayPlugin = {
  id: 'today' as const,
  generate(context: ReadingContext): ReadingResultV1 {
    const seed = hashProfile(context.primary)
    const now = new Date()
    const dayIndex = Math.floor(now.getTime() / 86_400_000)
    const points: TimePoint[] = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(now)
      date.setDate(now.getDate() + index - 2)
      return { period: formatDate(date), label: dayLabel(date, context.locale), score: scoreFor(seed, dayIndex + index - 2), dimensions: dimensionMap(seed, dayIndex + index - 2, lifeKeys) }
    })
    const current = points[2]
    const dimensions = makeDimensions(seed, dayIndex, lifeKeys, context.locale)
    const high = [...points].sort((a, b) => b.score - a.score)[0]
    const low = [...points].sort((a, b) => a.score - b.score)[0]
    const isZh = context.locale === 'zh'
    const state = current.score >= 72 ? 'high' : current.score >= 48 ? 'mid' : 'low'
    const labels = isZh ? { high: '适合推进', mid: '稳步积累', low: '留出余量' } : { high: 'Move with intent', mid: 'Build steadily', low: 'Create some room' }

    return {
      ...baseResult(context, 'today'),
      headline: { score: current.score, label: labels[state], summary: isZh ? '今天的重点不是做更多，而是把最重要的一件事做完整。' : 'Today is less about doing more and more about finishing the one thing that matters.', confidence: 'medium' },
      dimensions,
      series: [{ id: '7d', label: isZh ? '7 日趋势' : '7-day rhythm', points }],
      moments: [
        { period: high.period, score: high.score, tone: 'positive', title: isZh ? '本周顺风日' : 'Tailwind day', summary: isZh ? '把需要推动的沟通或决定放在这一天。' : 'Place an important conversation or decision here.' },
        { period: low.period, score: low.score, tone: 'caution', title: isZh ? '本周缓冲日' : 'Buffer day', summary: isZh ? '减少临时承诺，给恢复留出空间。' : 'Reduce new commitments and protect recovery time.' },
      ],
      insights: [
        { id: 'focus', title: isZh ? '今日焦点' : 'Today’s focus', body: isZh ? '先完成一个可见成果，再开启新的任务。' : 'Finish one visible outcome before opening another task.', tone: 'positive' },
        { id: 'signal', title: isZh ? '节奏信号' : 'Rhythm signal', body: isZh ? '高分维度适合主动使用，低分维度适合减少消耗。' : 'Use high-scoring dimensions actively and reduce load on lower ones.', tone: 'neutral' },
      ],
      actions: [
        { id: 'do-1', label: isZh ? '去做' : 'Do', body: isZh ? '安排 45 分钟无打扰时间，推进最关键任务。' : 'Block 45 distraction-free minutes for the most important task.', tone: 'positive' },
        { id: 'do-2', label: isZh ? '去连接' : 'Connect', body: isZh ? '主动联系一个能帮助事情前进的人。' : 'Reach out to one person who can move the work forward.', tone: 'neutral' },
        { id: 'avoid', label: isZh ? '先避免' : 'Avoid', body: isZh ? '疲劳时做高成本承诺或情绪化回应。' : 'High-cost commitments or reactive replies while tired.', tone: 'caution' },
      ],
    }
  },
}

const timelinePlugin = {
  id: 'timeline' as const,
  generate(context: ReadingContext): ReadingResultV1 {
    const seed = hashProfile(context.primary)
    const currentYear = new Date().getFullYear()
    const birthYear = Number(context.primary.birthDate.slice(0, 4))
    const yearly: TimePoint[] = Array.from({ length: 18 }, (_, index) => {
      const year = currentYear - 4 + index
      return { period: String(year), label: String(year), age: year - birthYear, score: scoreFor(seed, index), dimensions: dimensionMap(seed, index, lifeKeys) }
    })
    const current = yearly[4]
    const monthly: TimePoint[] = Array.from({ length: 12 }, (_, index) => {
      const date = new Date(currentYear, index, 1)
      return { period: `${currentYear}-${String(index + 1).padStart(2, '0')}`, label: monthLabel(date, context.locale), score: scoreFor(seed + 311, index), dimensions: dimensionMap(seed + 311, index, lifeKeys) }
    })
    const dimensions = makeDimensions(seed, 4, lifeKeys, context.locale)
    const ranked = [...yearly].sort((a, b) => b.score - a.score)
    const low = [...yearly].sort((a, b) => a.score - b.score)[0]
    const isZh = context.locale === 'zh'
    const label = current.score >= 72 ? (isZh ? '扩张与行动' : 'Expand and act') : current.score >= 48 ? (isZh ? '整理与积累' : 'Consolidate and build') : (isZh ? '休整与校准' : 'Rest and recalibrate')

    return {
      ...baseResult(context, 'timeline'),
      headline: { score: current.score, label, summary: isZh ? '把长期趋势当作规划参考，而不是固定答案。关注维度之间的错位，比单一总分更有价值。' : 'Use the long view as a planning reference, not a fixed answer. The gaps between dimensions matter more than one total score.', confidence: 'medium' },
      dimensions,
      series: [
        { id: '18y', label: isZh ? '18 年' : '18 years', points: yearly },
        { id: '10y', label: isZh ? '10 年' : '10 years', points: yearly.slice(2, 12) },
        { id: '1y', label: isZh ? '1 年' : '1 year', points: monthly },
      ],
      moments: [
        { period: ranked[0].period, score: ranked[0].score, tone: 'positive', title: isZh ? '第一高点' : 'Primary peak', summary: isZh ? '事业与成长维度更适合主动推进。' : 'Career and growth are better positioned for deliberate action.' },
        { period: ranked[1].period, score: ranked[1].score, tone: 'positive', title: isZh ? '第二高点' : 'Secondary peak', summary: isZh ? '适合扩大已有成果，而不是完全换方向。' : 'Scale what already works instead of changing direction completely.' },
        { period: low.period, score: low.score, tone: 'caution', title: isZh ? '调整窗口' : 'Reset window', summary: isZh ? '减少噪音，保护身心和关系边界。' : 'Reduce noise and protect wellbeing and relationship boundaries.' },
      ],
      insights: [
        { id: 'current', title: isZh ? '当前周期' : 'Current cycle', body: isZh ? '当前更适合建立可重复的方法，把偶然成果变成稳定能力。' : 'Build repeatable methods now so occasional wins become durable capability.', tone: 'neutral' },
        { id: 'next', title: isZh ? '下一步' : 'Next move', body: isZh ? '优先使用得分最高的维度，低分维度只维持基本盘。' : 'Lead with the highest-scoring dimension and keep lower ones stable.', tone: 'positive' },
      ],
      actions: [
        { id: 'plan', label: isZh ? '30 天' : '30 days', body: isZh ? '设定一个可见成果和一个停止事项。' : 'Choose one visible outcome and one thing to stop.', tone: 'positive' },
        { id: 'review', label: isZh ? '每月复盘' : 'Monthly review', body: isZh ? '记录真实事件，比较趋势和体感是否一致。' : 'Record real events and compare the trend with lived experience.', tone: 'neutral' },
      ],
    }
  },
}

const bondsPlugin = {
  id: 'bonds' as const,
  generate(context: ReadingContext): ReadingResultV1 {
    const secondary = context.secondary ?? demoPartnerProfile
    const seedA = hashProfile(context.primary)
    const seedB = hashProfile(secondary)
    const seed = hashText(`${Math.min(seedA, seedB)}|${Math.max(seedA, seedB)}|${context.relationshipType ?? 'partner'}`)
    const dimensions = makeDimensions(seed, 5, bondKeys, context.locale)
    const overall = clamp(dimensions.reduce((sum, item) => sum + item.score, 0) / dimensions.length)
    const currentMonth = new Date().getMonth()
    const points: TimePoint[] = Array.from({ length: 12 }, (_, index) => {
      const date = new Date(new Date().getFullYear(), currentMonth + index, 1)
      return { period: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`, label: monthLabel(date, context.locale), score: scoreFor(seed, index, overall), dimensions: dimensionMap(seed, index, bondKeys) }
    })
    const high = [...points].sort((a, b) => b.score - a.score)[0]
    const low = [...points].sort((a, b) => a.score - b.score)[0]
    const sorted = [...dimensions].sort((a, b) => b.score - a.score)
    const isZh = context.locale === 'zh'
    const label = overall >= 75 ? (isZh ? '高协同关系' : 'High-synergy bond') : overall >= 56 ? (isZh ? '互补型关系' : 'Complementary bond') : (isZh ? '需要主动磨合' : 'Intentional-work bond')

    return {
      ...baseResult({ ...context, secondary }, 'bonds'),
      headline: { score: overall, label, summary: isZh ? '你们的优势来自互补，真正的挑战不是差异本身，而是如何解释彼此的节奏。' : 'Your strength comes from complementarity. The challenge is not difference itself, but how you interpret each other’s pace.', confidence: 'medium' },
      dimensions,
      series: [{ id: '12m', label: isZh ? '未来 12 个月' : 'Next 12 months', points }],
      moments: [
        { period: high.period, score: high.score, tone: 'positive', title: isZh ? '协同窗口' : 'Synergy window', summary: isZh ? '适合共同决定、旅行或启动一件新事情。' : 'A useful window for shared decisions, travel, or a new project.' },
        { period: low.period, score: low.score, tone: 'caution', title: isZh ? '沟通窗口' : 'Communication window', summary: isZh ? '重要讨论提前约定时间，不在情绪高点逼迫结论。' : 'Schedule important talks and avoid forcing conclusions at emotional peaks.' },
      ],
      insights: [
        { id: 'strength', title: isZh ? '自然优势' : 'Natural strength', body: isZh ? `${dimensionName(sorted[0].key, context.locale)}是你们最自然的协同来源。` : `${dimensionName(sorted[0].key, context.locale)} is your most natural source of alignment.`, tone: 'positive' },
        { id: 'friction', title: isZh ? '容易误解' : 'Likely friction', body: isZh ? `${dimensionName(sorted.at(-1)!.key, context.locale)}需要说清期待，不要假设对方理所当然会懂。` : `Name expectations around ${dimensionName(sorted.at(-1)!.key, context.locale)}; do not assume the other person already knows.`, tone: 'caution' },
      ],
      actions: [
        { id: 'ritual', label: isZh ? '每周一次' : 'Once a week', body: isZh ? '用 15 分钟交换本周压力、需要和一件值得感谢的事。' : 'Spend 15 minutes sharing one pressure, one need, and one appreciation.', tone: 'positive' },
        { id: 'boundary', label: isZh ? '冲突规则' : 'Conflict rule', body: isZh ? '先复述对方的意思，再表达自己的判断。' : 'Reflect the other person’s meaning before offering your judgment.', tone: 'neutral' },
      ],
    }
  },
}

const plugins = { today: todayPlugin, timeline: timelinePlugin, bonds: bondsPlugin }

export const localInsightEngine: InsightEngine = {
  id: 'local-deterministic-v2',
  generate(context) { return plugins[context.mode].generate(context) },
}

export const demoProfile: ProfileInput = { name: '', birthDate: '1992-08-18', birthTime: '09:30', gender: 'female' }
export const demoPartnerProfile: ProfileInput = { name: '', birthDate: '1989-03-12', birthTime: '18:20', gender: 'male' }
