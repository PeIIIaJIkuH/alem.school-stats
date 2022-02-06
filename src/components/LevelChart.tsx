import {FC, useMemo} from 'react'
import {observer} from 'mobx-react-lite'
import state from '../store/state'
import {ILabel, IPoint} from '../utils/types'

interface Props {
	xLabels: ILabel[]
}

export const LevelChart: FC<Props> = observer(({xLabels}) => {
	const yLabels: ILabel[] = useMemo(() => {
		const arr: ILabel[] = []
		if (state.levelCeil === 0 || state.levelGap === 0) {
			return arr
		}
		for (let level = 0; level <= state.levelCeil; level += state.levelGap) {
			arr.push({
				name: level.toLocaleString().replaceAll(' ', '&nbsp'),
				n: 900 - (level / state.levelCeil * 800),
			})
		}
		return arr
	}, [state.levelCeil, state.levelGap])

	const points: IPoint[] = useMemo(() => {
		const arr: IPoint[] = []
		if (state.projects.length === 0) {
			return arr
		}
		const firstDate = state.levels[0].date
		const firstMonth = new Date(firstDate.getUTCFullYear(), firstDate.getUTCMonth(), 1)
		const lastDate = state.levels[state.levels.length - 1].date
		const lastMonth = new Date(lastDate.getUTCFullYear(), lastDate.getUTCMonth() + 1)
		const timeDiff = lastMonth.getTime() - firstMonth.getTime()
		for (let i = 0; i < state.levels.length; i++) {
			const level = state.levels[i]
			arr.push({
				x: 100 + ((level.date.getTime() - firstMonth.getTime()) / timeDiff * 800),
				y: 900 - (level.amount / state.levelCeil * 800),
			})
		}
		return arr
	}, [state.projects, yLabels])

	return (
		<svg viewBox='0 0 1000 1000' className='svg'>
			<text x={500} y={50} alignmentBaseline='text-before-edge' textAnchor='middle' stroke='black' fontSize={20}>
				Level over Time
			</text>
			<polyline points='100,90 100,900 910,900' stroke='black' fill='none' strokeWidth={2}/>
			<g textAnchor='end'>
				<text x={80} y={60} alignmentBaseline='middle' stroke='black'>Level</text>
				{yLabels.map(({name, n}) => (
					<g key={name}>
						<text x={80} y={n} alignmentBaseline='middle'>
							{name}
						</text>
						{n !== 0 && (
							<line x1={100} y1={n} x2={900} y2={n} stroke='black' strokeDasharray={5}/>
						)}
					</g>
				))}
			</g>
			<g textAnchor='middle'>
				<text x={960} y={930} stroke='black'>Time</text>
				{xLabels.map(({name, n}) => (
					<g key={name}>
						<text x={n} y={930} key={name}>
							{name}
						</text>
						{n !== 0 && (
							<line x1={n} y1={900} x2={n} y2={100} stroke='black' strokeDasharray={5}/>
						)}
					</g>
				))}
			</g>
			<g stroke='black'>
				{points.map(({x, y}) => (
					<circle key={`${x}-${y}`} cx={x} cy={y} r={2}/>
				))}
				<polyline points={points.reduce((prev, cur) => prev + ` ${cur.x},${cur.y}`, '100,900')}
				          fill='none'
				/>
			</g>
		</svg>
	)
})
