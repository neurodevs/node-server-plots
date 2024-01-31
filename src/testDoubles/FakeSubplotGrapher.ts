import {
	Grapher,
	GrapherGenerateOptions,
	SubplotGrapherOptions,
} from '../types/nodeServerPlots.types'

export default class FakeSubplotGrapher implements Grapher {
	public static constructorCalledWith: SubplotGrapherOptions[] = []
	public static generateCalledWith: GrapherGenerateOptions[] = []

	public constructor(options: SubplotGrapherOptions) {
		FakeSubplotGrapher.constructorCalledWith.push(options)
	}

	public async generate(options: GrapherGenerateOptions) {
		FakeSubplotGrapher.generateCalledWith.push(options)
	}
}
