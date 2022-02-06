import {makeAutoObservable} from 'mobx'
import {fetchGraphql, getLevelFromXp} from '../utils/helpers'
import {ILevel, IProgress, IProject, ITransaction} from '../utils/types'

class State {
	id: number | null = null
	username = 'PeIIIaJIkuH'
	xp = 0
	level = 0
	transactions: ITransaction[] = []
	progresses: IProgress[] = []
	projectXp: Record<number, number> = {}
	projects: IProject[] = []
	levels: ILevel[] = []
	xpGap = 0
	xpCeil = 0
	monthGap = 0
	monthCeil = 0
	levelGap = 0
	levelCeil = 0

	constructor() {
		makeAutoObservable(this)
	}

	setId(id: number) {
		this.id = id
	}

	async initialize() {
		await this.fetchUser()
		await this.fetchTransactions()
		await this.fetchProgresses()
		this.fillProjectXp()
		this.fillProjects()
		this.updateXpData()
		this.updateTimeData()
		this.updateLevelData()
	}

	async fetchUser() {
		const {data: {user: users}} = await fetchGraphql(`
				query getUser($username: String!) {
					user(where: {login: {_eq: $username}}) {
						id
					}
				}
			`, {
			username: this.username,
		})
		const [user] = users
		this.setId(user.id)
	}

	async fetchTransactions() {
		let offset = 0
		while (true) {
			const {data: {transaction: transactions}} = await fetchGraphql(`
            query getTransactions($username: String, $offset: Int) {
                transaction(
                    where: {
	                    user: {login: {_eq: $username}}
	                    type: {_eq: "xp"}
	                    object: {type: {_eq: "project"}}
	                }
	                offset: $offset
	            ) {
	                object {
	                    id
	                    name
	                }
	                amount
	                createdAt
                }
            }`,
				{
					username: this.username,
					offset,
				},
			)
			this.transactions.push(...transactions)
			if (transactions.length < 50) {
				break
			}
			offset += 50
		}
		this.transactions.sort(
			(a, b) => new Date(a.createdAt) > new Date(b.createdAt) ? 1 : -1,
		)
	}

	async fetchProgresses() {
		let offset = 0
		while (true) {
			const {data: {progress: progresses}} = await fetchGraphql(`
            query getProgresses($username: String, $offset: Int) {
                progress(
                    where: {
	                    user: {login: {_eq: $username}}
	                    isDone: {_eq: true}
	                    object: {type: {_eq: "project"}}
	                }
	                distinct_on: objectId
	                offset: $offset
                ) {
	                object {
	                    id
	                    name
	                }
                }
            }`,
				{
					username: this.username,
					offset,
				},
			)
			this.progresses.push(...progresses)
			if (progresses.length < 50) {
				break
			}
			offset += 50
		}
	}

	fillProjectXp() {
		for (const {object: {id: tId}, amount} of this.transactions) {
			if (this.progresses.find(({object: {id: pId}}) => pId === tId) &&
				!this.projectXp[tId] || this.projectXp[tId] < amount) {
				this.projectXp[tId] = amount
			}
		}
	}

	fillProjects() {
		for (const {object: {id, name}, amount, createdAt} of this.transactions) {
			const xp = this.projectXp[id]
			if (xp !== amount) {
				continue
			}
			this.xp += xp
			const level = getLevelFromXp(this.xp)
			if (level > this.level) {
				this.level = level
				this.levels.push({
					date: new Date(createdAt),
					amount: level,
				})
			}
			this.projects.push({
				id,
				name,
				xp,
				studentXp: this.xp,
				date: new Date(createdAt),
			})
		}
		this.level = getLevelFromXp(this.xp)
	}

	updateXpData() {
		this.xpGap = 10 ** (String(this.xp).length - 1)
		while (Math.ceil(this.xp / this.xpGap) <= 5) {
			this.xpGap /= 2
		}
		this.xpCeil = Math.ceil(this.xp / this.xpGap) * this.xpGap
		if (this.xp === this.xpCeil) {
			this.xpCeil += this.xpGap
		}
	}

	updateTimeData() {
		if (this.projects.length === 0) {
			return
		}
		const first = this.projects[0].date
		const last = this.projects[this.projects.length - 1].date
		if (first.getUTCFullYear() !== last.getUTCFullYear()) {
			this.monthCeil += (12 - first.getUTCMonth()) + (last.getUTCMonth() + 1)
		} else {
			this.monthCeil += last.getUTCMonth() - first.getUTCMonth()
		}
		for (let i = first.getUTCFullYear() + 1; i < last.getUTCFullYear(); i++) {
			this.monthCeil += 12
		}
		this.monthGap = Math.ceil(this.monthCeil / 10)
		this.monthCeil = Math.ceil(this.monthCeil / this.monthGap) * this.monthGap
	}

	updateLevelData() {
		this.levelGap = 10 ** (String(this.level).length - 1)
		while (Math.ceil(this.level / this.levelGap) <= 5) {
			this.levelGap /= 2
		}
		this.levelCeil = Math.ceil(this.level / this.levelGap) * this.levelGap
		if (this.level === this.levelCeil) {
			this.levelCeil += this.levelGap
		}
	}
}

export default new State()
