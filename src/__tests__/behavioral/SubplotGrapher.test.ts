import { randomInt } from 'crypto'
import AbstractSpruceTest, {
	test,
	assert,
	errorAssert,
} from '@sprucelabs/test-utils'
import { SubplotGrapher } from '../../SubplotGrapher'
import MockChartJSNodeCanvas from '../doubles/MockChartJSNodeCanvas'

export default class SubplotGrapherTest extends AbstractSpruceTest {
	private static grapher: SubplotGrapher
	private static subplotHeight: number
	private static subplotWidth: number

	protected static async beforeEach() {
		await super.beforeEach()

		SubplotGrapher.CanvasClass = MockChartJSNodeCanvas

		this.subplotHeight = randomInt(100, 1000)
		this.subplotWidth = randomInt(100, 1000)

		this.grapher = this.Grapher()
		assert.isTruthy(this.grapher)
	}

	@test()
	protected static async canSetAndGetChartJSNodeCanvasClass() {
		SubplotGrapher.CanvasClass = MockChartJSNodeCanvas
		assert.isEqual(SubplotGrapher.CanvasClass, MockChartJSNodeCanvas)
	}

	@test()
	protected static async instantiationThrowsWithMissingRequiredOptions() {
		// @ts-ignore
		const err = assert.doesThrow(() => new SubplotGrapher())
		errorAssert.assertError(err, 'MISSING_PARAMETERS', {
			parameters: ['subplotHeight', 'subplotWidth'],
		})
	}

	@test()
	protected static async runThrowsWithMissingRequiredOptions() {
		// @ts-ignore
		const err = await assert.doesThrowAsync(() => this.grapher.run())
		errorAssert.assertError(err, 'MISSING_PARAMETERS', {
			parameters: ['savePath', 'plotConfigs'],
		})
	}

	@test()
	protected static async runInstantiatesCanvasClassWithRequiredOptions() {
		await this.run()

		assert.isLength(MockChartJSNodeCanvas.constructorOptions, 1)
		assert.isEqualDeep(MockChartJSNodeCanvas.constructorOptions[0], {
			height: this.subplotHeight,
			width: this.subplotWidth,
		})
	}

	private static async run() {
		await this.grapher.run({
			savePath: 'asdf',
			plotConfigs: [],
		})
	}

	private static Grapher() {
		return new SubplotGrapher({
			subplotHeight: this.subplotHeight,
			subplotWidth: this.subplotWidth,
		})
	}
}
