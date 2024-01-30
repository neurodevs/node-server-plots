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

export interface PlotConfig {
	title: string
	datasets: Dataset[]
}

export interface Dataset {
	label: string
	data: number[]
}
