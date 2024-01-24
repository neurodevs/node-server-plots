import { assertOptions } from '@sprucelabs/schema'
import { ChartJSNodeCanvas } from 'chartjs-node-canvas'
import { ChartJSNodeCanvasClass } from './types/chartJSNodeCanvas'
import { Grapher, GrapherRunOptions } from './types/nodeServerPlots'

export class SubplotGrapher implements Grapher {
	public static CanvasClass: ChartJSNodeCanvasClass = ChartJSNodeCanvas

	public async run(options: GrapherRunOptions) {
		assertOptions(options, ['savePath', 'plotConfigs'])

		new SubplotGrapher.CanvasClass({ height: 300, width: 800 })
	}
}
