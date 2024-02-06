import { ScatterDataPoint } from 'chart.js'
import { MimeType } from 'chartjs-node-canvas'

export interface Grapher {
	generate(options: GrapherGenerateOptions): Promise<void>
}

export interface GrapherGenerateOptions {
	savePath: string
	plotConfigs: PlotConfig[]
}

export interface SubplotGrapherOptions {
	subplotHeight: number
	subplotWidth: number
	mimeType?: MimeType
}

export type SubplotGrapherClass = new (
	options: SubplotGrapherOptions
) => Grapher

export interface PlotConfig {
	title: string
	datasets: Dataset[]
	verticalLines?: number[]
}

export interface Dataset {
	label: string
	data: ScatterDataPoint[]
	color: string
}

export interface VerticalLineAnnotations {
	[key: string]: VerticalLineAnnotation
}

export interface VerticalLineAnnotation {
	type: string
	xMin: number
	xMax: number
	borderColor: string
	borderWidth: number
}
