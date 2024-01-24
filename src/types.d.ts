export interface Grapher {
	run(options: GrapherRunOptions): Promise<void>
}

export interface GrapherRunOptions {
	savePath: string
	plotConfigs: PlotConfig[]
}

export interface PlotConfig {}
