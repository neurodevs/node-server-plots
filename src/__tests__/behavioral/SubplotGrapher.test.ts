import { randomInt } from 'crypto'
import AbstractSpruceTest, {
	test,
	assert,
	errorAssert,
	generateId,
} from '@sprucelabs/test-utils'
import { ChartTypeRegistry } from 'chart.js'
import { MimeType } from 'chartjs-node-canvas'
import SubplotGrapher from '../../SubplotGrapher'
import { PlotConfig } from '../../types/nodeServerPlots.types'
import FakeChartJSNodeCanvas from '../doubles/FakeChartJSNodeCanvas'
import fakeSharp, { FakeSharpTracker } from '../doubles/fakeSharp'

export default class SubplotGrapherTest extends AbstractSpruceTest {
	private static grapher: SubplotGrapher
	private static subplotHeight: number
	private static subplotWidth: number
	private static savePath: string
	private static plotConfigs: PlotConfig[]
	private static mimetype: MimeType
	private static numSamplesPerDataset: number

	protected static async beforeEach() {
		await super.beforeEach()

		SubplotGrapher.CanvasClass = FakeChartJSNodeCanvas
		SubplotGrapher.sharp = fakeSharp

		this.subplotHeight = randomInt(100, 1000)
		this.subplotWidth = randomInt(100, 1000)

		this.savePath = 'asdf'
		this.plotConfigs = [
			this.generatePlotConfig(),
			this.generatePlotConfig(),
			this.generatePlotConfig(),
		]
		this.mimetype = ['image/png', 'image/jpeg'][randomInt(0, 2)] as MimeType

		this.numSamplesPerDataset = randomInt(1, 100)

		this.grapher = this.Grapher()
		assert.isTruthy(this.grapher)
	}

	@test()
	protected static async canSetAndGetChartJSNodeCanvasClass() {
		SubplotGrapher.CanvasClass = FakeChartJSNodeCanvas
		assert.isEqual(SubplotGrapher.CanvasClass, FakeChartJSNodeCanvas)
	}

	@test()
	protected static async canSetAndGetSharpFunction() {
		SubplotGrapher.sharp = fakeSharp
		assert.isEqual(SubplotGrapher.sharp, fakeSharp)
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
		const err = await assert.doesThrowAsync(() => this.grapher.generate())
		errorAssert.assertError(err, 'MISSING_PARAMETERS', {
			parameters: ['savePath', 'plotConfigs'],
		})
	}

	@test()
	protected static async runCallsDependenciesAsRequired() {
		await this.run()

		assert.isLength(
			FakeChartJSNodeCanvas.constructorOptions,
			this.plotConfigs.length
		)

		for (const options of FakeChartJSNodeCanvas.constructorOptions) {
			assert.isEqualDeep(options, {
				height: this.subplotHeight,
				width: this.subplotWidth,
			})
		}

		assert.isLength(
			FakeChartJSNodeCanvas.renderToBufferOptions,
			this.plotConfigs.length
		)

		for (let i = 0; i < this.plotConfigs.length; i++) {
			const actual = FakeChartJSNodeCanvas.renderToBufferOptions[i]
			const expected = {
				configuration: this.generateChartConfiguration(this.plotConfigs[i]),
				mimeType: this.mimetype,
			}

			assert.isEqualDeep(actual, expected)
		}

		assert.isLength(FakeSharpTracker.sharpCalls, 1)
		assert.isEqualDeep(FakeSharpTracker.sharpCalls[0], {
			create: {
				width: this.subplotWidth,
				height: this.subplotHeight * this.expectedNumSubplots,
				channels: 4,
				background: { r: 255, g: 255, b: 255, alpha: 0 },
			},
		})

		assert.isLength(FakeSharpTracker.compositeCalls, this.expectedNumSubplots)
		for (let i = 0; i < this.expectedNumSubplots; i++) {
			const calledImage = FakeSharpTracker.compositeCalls[i][0]

			assert.doesInclude(calledImage, {
				top: this.subplotHeight * i,
				left: 0,
			})
			assert.isObject(calledImage.input)
		}

		assert.isLength(FakeSharpTracker.toFileCalls, 1)
		assert.isEqualDeep(FakeSharpTracker.toFileCalls[0], this.savePath)
	}

	private static generatePlotConfig() {
		return {
			title: generateId(),
			datasets: [
				this.generateDataset(),
				this.generateDataset(),
				this.generateDataset(),
			],
		}
	}

	private static generateDataset() {
		return {
			label: generateId(),
			data: Array.from({ length: this.numSamplesPerDataset }, () =>
				Math.random()
			),
		}
	}

	private static generateChartConfiguration(plotConfig: PlotConfig) {
		const { title, datasets } = plotConfig

		return {
			type: 'line' as keyof ChartTypeRegistry,
			data: {
				labels: [],
				datasets: datasets.map(({ label, data }) => {
					return {
						label,
						data,
						fill: false,
					}
				}),
			},
			options: {
				plugins: {
					title: {
						display: true,
						text: title,
						font: {
							size: 16,
						},
						padding: {
							top: 10,
							bottom: 30,
						},
					},
				},
			},
		}
	}

	private static get expectedNumSubplots() {
		return this.plotConfigs.length
	}

	private static async run() {
		await this.grapher.generate({
			savePath: this.savePath,
			plotConfigs: this.plotConfigs,
		})
	}

	private static Grapher() {
		return new SubplotGrapher({
			subplotHeight: this.subplotHeight,
			subplotWidth: this.subplotWidth,
			mimeType: this.mimetype,
		})
	}
}
