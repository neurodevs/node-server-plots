export interface Grapher {
	run(options: GrapherRunOptions): Promise<void>
}

export interface GrapherRunOptions {
	savePath: string
	plotConfigs: PlotConfig[]
}

export interface SubplotGrapherOptions {
	subplotHeight: number
	subplotWidth: number
}

export interface PlotConfig {}
