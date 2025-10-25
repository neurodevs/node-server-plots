import {
    Grapher,
    GrapherGenerateOptions,
    SubplotGrapherOptions,
} from '../../types/nodeServerPlots.types'

export default class FakeSubplotGrapher implements Grapher {
    public static callsToConstructor: SubplotGrapherOptions[] = []
    public static callsToGenerate: GrapherGenerateOptions[] = []

    public constructor(options: SubplotGrapherOptions) {
        FakeSubplotGrapher.callsToConstructor.push(options)
    }

    public async generate(options: GrapherGenerateOptions) {
        FakeSubplotGrapher.callsToGenerate.push(options)
    }

    public static resetTestDouble() {
        FakeSubplotGrapher.callsToConstructor = []
        FakeSubplotGrapher.callsToGenerate = []
    }
}
