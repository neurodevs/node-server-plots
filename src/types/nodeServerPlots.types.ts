import { MimeType } from 'chartjs-node-canvas'

export interface Grapher {
	generate(options: GrapherRunOptions): Promise<void>
}

export interface GrapherRunOptions {
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
