import { assertOptions } from '@sprucelabs/schema'
import { ChartJSNodeCanvas } from 'chartjs-node-canvas'
import { ChartJSNodeCanvasClass } from './ChartJSNodeCanvas'
import { Grapher, GrapherRunOptions } from './types'

export class SubplotGrapher implements Grapher {
	public static CanvasClass: ChartJSNodeCanvasClass = ChartJSNodeCanvas

	public async run(options: GrapherRunOptions) {
		assertOptions(options, ['savePath', 'plotConfigs'])
	}
}
