import { assertOptions } from '@sprucelabs/schema'
import { ChartJSNodeCanvas } from 'chartjs-node-canvas'
import { ChartJSNodeCanvasClass } from './types/chartJSNodeCanvas.types'
import {
	Grapher,
	GrapherRunOptions,
	SubplotGrapherOptions,
} from './types/nodeServerPlots.types'

export class SubplotGrapher implements Grapher {
	public static CanvasClass: ChartJSNodeCanvasClass = ChartJSNodeCanvas

	private subplotHeight: number
	private subplotWidth: number

	public constructor(options: SubplotGrapherOptions) {
		const { subplotHeight, subplotWidth } = assertOptions(options, [
			'subplotHeight',
			'subplotWidth',
		])

		this.subplotHeight = subplotHeight
		this.subplotWidth = subplotWidth
	}

	public async run(options: GrapherRunOptions) {
		assertOptions(options, ['savePath', 'plotConfigs'])

		new SubplotGrapher.CanvasClass({
			height: this.subplotHeight,
			width: this.subplotWidth,
		})
	}
}
