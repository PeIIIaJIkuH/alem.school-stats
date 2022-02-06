import {FC, useEffect} from 'react'
import state from '../store/state'
import {observer} from 'mobx-react-lite'

export const UserInfo: FC = observer(() => {
	useEffect(() => {
		state.initialize().then()
	}, [])

	return (
		<div className='user-info'>
			<div className='user-info__item'>
				<div className='user-info__header'>ID</div>
				<div className='user-info__content'>
					{Number(state.id).toLocaleString().replaceAll(' ', '&nbsp')}
				</div>
			</div>
			<div className='user-info__item'>
				<div className='user-info__header'>Username</div>
				<div className='user-info__content'>{state.username}</div>
			</div>
			<div className='user-info__item'>
				<div className='user-info__header'>XP</div>
				<div className='user-info__content'>
					{state.xp.toLocaleString().replaceAll(' ', '&nbsp')}
				</div>
			</div>
			<div className='user-info__item'>
				<div className='user-info__header'>Level</div>
				<div className='user-info__content'>
					{state.level.toLocaleString().replaceAll(' ', '&nbsp')}
				</div>
			</div>
		</div>
	)
})
