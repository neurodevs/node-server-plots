import AbstractSpruceTest, {
	test,
	assert,
	errorAssert,
} from '@sprucelabs/test-utils'
import { SubplotGrapher } from '../../SubplotGrapher'
import StubChartJSNodeCanvas from '../doubles/StubChartJSNodeCanvas'

export default class SubplotGrapherTest extends AbstractSpruceTest {
	private static grapher: SubplotGrapher

	protected static async beforeEach() {
		await super.beforeEach()
		this.grapher = this.Grapher()
		assert.isTruthy(this.grapher)
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
	protected static async canSetAndGetChartJSNodeCanvasClass() {
		SubplotGrapher.CanvasClass = StubChartJSNodeCanvas
		assert.isEqual(SubplotGrapher.CanvasClass, StubChartJSNodeCanvas)
	}

	private static Grapher() {
		return new SubplotGrapher()
	}
}
