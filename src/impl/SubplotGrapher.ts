import { Chart, ChartTypeRegistry } from 'chart.js'
import { ChartJSNodeCanvas, MimeType } from 'chartjs-node-canvas'
import annotationPlugin from 'chartjs-plugin-annotation'
import sharp from 'sharp'
import { ChartJSNodeCanvasClass } from '../types/chartJSNodeCanvas.types'
import {
    Dataset,
    Grapher,
    GrapherGenerateOptions,
    PlotConfig,
    SubplotGrapherClass,
    SubplotGrapherOptions,
    VerticalLineAnnotations,
} from '../types/nodeServerPlots.types'
import { SharpType } from '../types/sharp.types'

Chart.register(annotationPlugin)

export default class SubplotGrapher implements Grapher {
    public static Class?: SubplotGrapherClass
    public static Canvas: ChartJSNodeCanvasClass = ChartJSNodeCanvas
    public static sharp: SharpType = sharp

    private subplotHeight: number
    private subplotWidth: number
    private mimeType: MimeType

    private currentSavePath!: string
    private currentPlotConfigs!: PlotConfig[]
    private currentPlotConfig!: PlotConfig
    private currentBuffers!: Buffer<ArrayBufferLike>[]

    protected constructor(options: SubplotGrapherOptions) {
        const { subplotHeight, subplotWidth, mimeType = 'image/png' } = options

        this.subplotHeight = subplotHeight
        this.subplotWidth = subplotWidth
        this.mimeType = mimeType
    }

    public static Create(options: SubplotGrapherOptions) {
        return new (this.Class ?? this)(options)
    }

    public async generate(options: GrapherGenerateOptions) {
        const { savePath, plotConfigs } = options

        this.currentSavePath = savePath
        this.currentPlotConfigs = plotConfigs

        await this.renderPlotConfigsToBuffers()
        await this.generateCompositeImage()
    }

    private async renderPlotConfigsToBuffers() {
        this.currentBuffers = []

        for (const plotConfig of this.currentPlotConfigs) {
            this.currentPlotConfig = plotConfig

            const buffer = await this.renderCanvasToBuffer()
            this.currentBuffers.push(buffer)
        }
    }

    private async renderCanvasToBuffer() {
        const canvas = this.ChartJSNodeCanvas()
        const chartConfig = this.generateChartConfig()

        return await canvas.renderToBuffer(chartConfig as any, this.mimeType)
    }

    private generateChartConfig() {
        const { title, datasets, verticalLines } = this.currentPlotConfig

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
                            ? this.generateVerticalLineAnnotations(
                                  verticalLines
                              )
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
                            callback: this.xAxisTicksCallback,
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

    private get xAxisTicksCallback() {
        return (value: number, idx: number) => {
            const showLabelEveryXTicks = 5
            const shouldShowLabel = idx % showLabelEveryXTicks === 0
            return shouldShowLabel ? value : ''
        }
    }

    private async generateCompositeImage() {
        const sharp = this.sharp()
        sharp.composite(this.imagesFromBuffers)

        await sharp.toFile(this.currentSavePath)
    }

    private get imagesFromBuffers() {
        const images = []

        for (let i = 0; i < this.currentBuffers.length; i++) {
            images.push({
                input: this.currentBuffers[i],
                top: this.subplotHeight * i,
                left: 0,
            })
        }
        return images
    }

    private ChartJSNodeCanvas() {
        return new SubplotGrapher.Canvas({
            height: this.subplotHeight,
            width: this.subplotWidth,
        })
    }

    private sharp() {
        return SubplotGrapher.sharp({
            create: {
                width: this.subplotWidth,
                height: this.subplotHeight * this.currentPlotConfigs.length,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 1 },
            },
        })
    }
}
