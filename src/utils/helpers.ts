import {API_ENDPOINT} from './constants'

export const fetchGraphql = async (query: string, variables?: Object): Promise<{ data: any }> => {
	const response = await fetch(API_ENDPOINT, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query, variables,
		}),
	})
	return await response.json()
}

const totalXPForLevel = (level: number): number =>
	Math.round((level * 0.66 + 1) * ((level + 2) * 150 + 50))

const cumulativeXpForLevel = (level: number): number =>
	level > 0 ? totalXPForLevel(level) + cumulativeXpForLevel(level - 1) : 0

export const getLevelFromXp = (xp: number, level: number = 0): number =>
	cumulativeXpForLevel(level) >= xp ? level : getLevelFromXp(xp, level + 1)

export const getNumber = (n: number): string => {
	const s = `0${n % 100}`
	return s.substring(s.length - 2)
}

export const getDate = (month: number, startYear: number): string => {
	let m = month
	let y = startYear
	while (m > 12) {
		m -= 12
		y++
	}
	return `${getNumber(m)}.${getNumber(y)}`
}
