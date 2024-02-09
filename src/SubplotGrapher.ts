import { assertOptions } from '@sprucelabs/schema'
import { Chart, ChartTypeRegistry } from 'chart.js'
import { ChartJSNodeCanvas, MimeType } from 'chartjs-node-canvas'
import annotationPlugin from 'chartjs-plugin-annotation'
import sharp from 'sharp'
import { ChartJSNodeCanvasClass } from './types/chartJSNodeCanvas.types'
import {
	Dataset,
	Grapher,
	GrapherGenerateOptions,
	PlotConfig,
	SubplotGrapherOptions,
	VerticalLineAnnotations,
} from './types/nodeServerPlots.types'
import { sharpType } from './types/sharp.types'

Chart.register(annotationPlugin)

export default class SubplotGrapher implements Grapher {
	public static CanvasClass: ChartJSNodeCanvasClass = ChartJSNodeCanvas
	public static sharp: sharpType = sharp

	private subplotHeight: number
	private subplotWidth: number
	private mimeType: MimeType

	public constructor(options: SubplotGrapherOptions) {
		const {
			subplotHeight,
			subplotWidth,
			mimeType = 'image/png',
		} = assertOptions(options, ['subplotHeight', 'subplotWidth'])

		this.subplotHeight = subplotHeight
		this.subplotWidth = subplotWidth
		this.mimeType = mimeType
	}

	public async generate(options: GrapherGenerateOptions) {
		const { savePath, plotConfigs } = assertOptions(options, [
			'savePath',
			'plotConfigs',
		])

		const buffers = []

		for (const plotConfig of plotConfigs) {
			const canvas = new SubplotGrapher.CanvasClass({
				height: this.subplotHeight,
				width: this.subplotWidth,
			})

			const chartConfiguration = this.generateChartConfiguration(plotConfig)

			const buffer = await canvas.renderToBuffer(
				chartConfiguration as any,
				this.mimeType
			)
			buffers.push(buffer)
		}

		const sharpInstance = SubplotGrapher.sharp({
			create: {
				width: this.subplotWidth,
				height: this.subplotHeight * plotConfigs.length,
				channels: 4,
				background: { r: 255, g: 255, b: 255, alpha: 1 },
			},
		})

		const images = []

		for (let i = 0; i < buffers.length; i++) {
			images.push({ input: buffers[i], top: this.subplotHeight * i, left: 0 })
		}

		sharpInstance.composite(images)
		await sharpInstance.toFile(savePath)
	}

	private generateChartConfiguration(plotConfig: PlotConfig) {
		const { title, datasets, verticalLines } = plotConfig

		return {
			type: 'line' as keyof ChartTypeRegistry,
			data: {
				datasets: this.generateDatasets(datasets),
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
					annotation: {
						annotations: verticalLines
							? this.generateVerticalLineAnnotations(verticalLines)
							: null,
					},
				},
				scales: {
					x: {
						type: 'linear',
						title: {
							display: true,
							text: 'Time (seconds)',
						},
						ticks: {
							stepSize: 1,
							callback: xAxisTicksCallback,
							autoSkip: false,
							maxRotation: 0,
						},
					},
				},
			},
		}
	}

	private generateDatasets(datasets: Dataset[]) {
		return datasets.map(({ label, data, color }) => {
			const sortedData = data.sort((a, b) => Number(a.x) - Number(b.x))

			return {
				label,
				data: sortedData,
				borderColor: color,
				borderWidth: 1,
				fill: false,
				pointRadius: 0,
			}
		})
	}

	private generateVerticalLineAnnotations(xValues: number[]) {
		const annotations: VerticalLineAnnotations = {}

		for (let i = 0; i < xValues.length; i++) {
			const lineName = `vertical-line-${i}`
			const x = xValues[i]

			annotations[lineName] = {
				type: 'line',
				xMin: x,
				xMax: x,
				borderColor: 'red',
				borderWidth: 1,
			}
		}

		return annotations
	}
}

export function xAxisTicksCallback(value: number, idx: number) {
	const showLabelEveryXTicks = 5
	const shouldShowLabel = idx % showLabelEveryXTicks === 0
	return shouldShowLabel ? value : ''
}
