export interface ITransaction {
	amount: number
	createdAt: string
	object: IObject
}

export interface IProgress {
	object: IObject
}

export interface IObject {
	id: number
	name: string
}

export interface IProject {
	id: number
	name: string
	date: Date
	xp: number
	studentXp: number
}

export interface ILevel {
	date: Date
	amount: number
}

export interface ILabel {
	name: string
	n: number
}

export interface IPoint {
	x: number
	y: number
}
