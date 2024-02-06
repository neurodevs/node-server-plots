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
import FakeChartJSNodeCanvas from '../../testDoubles/FakeChartJSNodeCanvas'
import fakeSharp, { FakeSharpTracker } from '../../testDoubles/fakeSharp'
import {
	PlotConfig,
	SubplotGrapherOptions,
} from '../../types/nodeServerPlots.types'

export default class SubplotGrapherTest extends AbstractSpruceTest {
	private static grapher: SubplotGrapher
	private static subplotHeight: number
	private static subplotWidth: number
	private static savePath: string
	private static plotConfigs: PlotConfig[]
	private static mimetype: MimeType
	private static numSamplesPerDataset: number
	private static realGrapher: SubplotGrapher

	protected static async beforeAll() {
		await super.beforeAll()

		this.realGrapher = this.Grapher({ subplotHeight: 300, subplotWidth: 800 })

		this.subplotHeight = randomInt(100, 1000)
		this.subplotWidth = randomInt(100, 1000)

		this.numSamplesPerDataset = randomInt(10, 100)

		this.savePath = generateId()
		this.plotConfigs = [
			this.generatePlotConfig(),
			this.generatePlotConfig(),
			this.generatePlotConfig(),
		]
		this.mimetype = ['image/png', 'image/jpeg'][randomInt(0, 2)] as MimeType

		await this.realGrapher.generate({
			savePath: `src/__tests__/test.plot.png`,
			plotConfigs: this.plotConfigs,
		})
	}

	protected static async beforeEach() {
		await super.beforeEach()

		SubplotGrapher.CanvasClass = FakeChartJSNodeCanvas
		SubplotGrapher.sharp = fakeSharp

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
				background: { r: 255, g: 255, b: 255, alpha: 1 },
			},
		})

		assert.isLength(FakeSharpTracker.compositeCalls, 1)

		const calledImages = FakeSharpTracker.compositeCalls[0]

		for (let i = 0; i < calledImages.length; i++) {
			const calledImage = calledImages[i]

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
				this.generateDataset(1),
				this.generateDataset(2),
				this.generateDataset(3),
			],
		}
	}

	private static generateDataset(yMin: number) {
		const newLocal = {
			label: generateId(),
			data: Array.from({ length: this.numSamplesPerDataset }, (_, i) => {
				return { x: i.toString(), y: yMin + Math.random() }
			}),
			color: this.randomColor(),
		}
		return newLocal
	}

	private static randomColor() {
		const options = ['red', 'blue', 'green', 'black', 'purple']
		return options[randomInt(0, options.length)]
	}

	private static generateChartConfiguration(plotConfig: PlotConfig) {
		const { title, datasets } = plotConfig

		return {
			type: 'line' as keyof ChartTypeRegistry,
			data: {
				datasets: datasets.map(({ label, data, color }) => {
					return {
						label,
						data,
						borderColor: color,
						borderWidth: 1,
						fill: false,
						pointRadius: 0,
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
							top: 30,
							bottom: 20,
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

	private static Grapher(options?: Partial<SubplotGrapherOptions>) {
		return new SubplotGrapher({
			subplotHeight: this.subplotHeight,
			subplotWidth: this.subplotWidth,
			mimeType: this.mimetype,
			...options,
		})
	}
}
