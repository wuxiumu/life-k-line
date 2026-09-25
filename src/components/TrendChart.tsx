import type { DimensionKey, TimePoint } from '../types'

interface TrendChartProps {
  data: TimePoint[]
  selectedDimension?: DimensionKey | 'overall'
  currentPeriod?: string
  ariaLabel: string
}

const WIDTH = 920
const HEIGHT = 330
const PADDING = { top: 28, right: 24, bottom: 46, left: 46 }

export default function TrendChart({ data, selectedDimension = 'overall', currentPeriod, ariaLabel }: TrendChartProps) {
  const chartWidth = WIDTH - PADDING.left - PADDING.right
  const chartHeight = HEIGHT - PADDING.top - PADDING.bottom
  const value = (point: TimePoint) => selectedDimension === 'overall' ? point.score : point.dimensions?.[selectedDimension] ?? point.score
  const x = (index: number) => PADDING.left + (index / Math.max(1, data.length - 1)) * chartWidth
  const y = (score: number) => PADDING.top + ((100 - score) / 100) * chartHeight
  const points = data.map((point, index) => `${x(index)},${y(value(point))}`).join(' ')
  const area = `${PADDING.left},${PADDING.top + chartHeight} ${points} ${x(data.length - 1)},${PADDING.top + chartHeight}`
  const values = data.map(value)
  const max = Math.max(...values)
  const min = Math.min(...values)

  return (
    <div className="chart-wrap" aria-label={ariaLabel}>
      <svg className="trend-chart" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img">
        {[25, 50, 75].map((gridValue) => (
          <g key={gridValue}>
            <line className="grid-line" x1={PADDING.left} x2={WIDTH - PADDING.right} y1={y(gridValue)} y2={y(gridValue)} />
            <text className="axis-label" x={PADDING.left - 12} y={y(gridValue) + 4} textAnchor="end">{gridValue}</text>
          </g>
        ))}
        <polygon className="chart-area" points={area} />
        <polyline className="chart-line" points={points} />
        {data.map((point, index) => {
          const score = value(point)
          const featured = point.period === currentPeriod || score === max || score === min
          const labelStep = data.length > 13 ? 3 : data.length > 8 ? 2 : 1
          return (
            <g className="chart-point" key={point.period}>
              <circle cx={x(index)} cy={y(score)} r={featured ? 6 : 3} />
              <title>{`${point.label}: ${score}`}</title>
              {(index % labelStep === 0 || index === data.length - 1) && <text className="year-label" x={x(index)} y={HEIGHT - 16} textAnchor="middle">{point.label.length === 4 ? point.label.slice(2) : point.label}</text>}
            </g>
          )
        })}
        {data.map((point, index) => point.period === currentPeriod && <line key="current" className="current-line" x1={x(index)} x2={x(index)} y1={PADDING.top} y2={PADDING.top + chartHeight} />)}
      </svg>
    </div>
  )
}
