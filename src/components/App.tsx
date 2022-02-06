import {FC, Fragment, useMemo} from 'react'
import {observer} from 'mobx-react-lite'
import {UserInfo} from './UserInfo'
import {XpChart} from './XpChart'
import {ILabel} from '../utils/types'
import state from '../store/state'
import {getDate} from '../utils/helpers'
import {LevelChart} from './LevelChart'

export const App: FC = observer(() => {
	const xLabels: ILabel[] = useMemo(() => {
		const arr: ILabel[] = []
		if (state.projects.length === 0) {
			return arr
		}
		const firstDate = state.projects[0].date
		const startYear = firstDate.getUTCFullYear()
		const startMonth = firstDate.getUTCMonth() + 1
		for (let m = startMonth; m < startMonth + state.monthCeil + 1; m += state.monthGap) {
			arr.push({
				name: getDate(m, startYear),
				n: 100 + ((m - startMonth) / state.monthCeil * 800),
			})
		}
		return arr
	}, [state.monthCeil, state.monthGap, state.projects])

	return (
		<Fragment>
			<UserInfo/>
			<div className='wrapper'>
				<XpChart xLabels={xLabels}/>
				<LevelChart xLabels={xLabels}/>
			</div>
		</Fragment>
	)
})
