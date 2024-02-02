import { assertOptions } from '@sprucelabs/schema'
import { ChartTypeRegistry } from 'chart.js'
import { ChartJSNodeCanvas, MimeType } from 'chartjs-node-canvas'
import sharp from 'sharp'
import { ChartJSNodeCanvasClass } from './types/chartJSNodeCanvas.types'
import {
	Grapher,
	GrapherGenerateOptions,
	PlotConfig,
	SubplotGrapherOptions,
} from './types/nodeServerPlots.types'
import { sharpType } from './types/sharp.types'

import {} from 'chartjs-adapter-date-fns'

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
				chartConfiguration,
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
		const { title, datasets } = plotConfig

		return {
			type: 'line' as keyof ChartTypeRegistry,
			data: {
				labels: [],
				datasets: datasets.map(({ label, data, color }) => {
					return {
						label,
						data,
						borderColor: color,
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
				scales: {
					x: {
						type: 'time' as const,
						time: {
							unit: 'millisecond' as const,
							displayFormats: {
								millisecond: 'h:mm:ss aaaa',
							},
						},
						title: {
							display: true,
							text: 'Time (seconds)',
						},
					},
				},
			},
		}
	}
}
