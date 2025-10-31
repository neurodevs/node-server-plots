import { randomInt } from 'crypto'
import generateId from '@neurodevs/generate-id'
import { test, assert } from '@neurodevs/node-tdd'
import { MimeType } from 'chartjs-node-canvas'

import { ChartTypeRegistryType } from '../../chartjs/importChartjsCjs.js'
import SubplotGrapher from '../../impl/SubplotGrapher.js'
import FakeChartJSNodeCanvas from '../../testDoubles/chartjs/FakeChartJSNodeCanvas.js'
import fakeSharp, {
    FakeSharpTracker,
} from '../../testDoubles/sharp/fakeSharp.js'
import {
    Grapher,
    PlotConfig,
    SubplotGrapherOptions,
    VerticalLineAnnotations,
} from '../../types/nodeServerPlots.types.js'
import AbstractPackageTest from '../AbstractPackageTest.js'

export default class SubplotGrapherTest extends AbstractPackageTest {
    private static fakeGrapher: Grapher
    private static subplotHeight: number
    private static subplotWidth: number
    private static savePath: string
    private static plotConfigs: PlotConfig[]
    private static mimetype: MimeType
    private static numSamplesPerDataset: number
    private static realGrapher: Grapher

    protected static async beforeAll() {
        await super.beforeAll()

        this.realGrapher = this.SubplotGrapher({
            subplotHeight: 300,
            subplotWidth: 800,
        })

        this.subplotHeight = randomInt(100, 1000)
        this.subplotWidth = randomInt(100, 1000)

        this.numSamplesPerDataset = randomInt(10, 100)

        this.savePath = generateId()

        this.plotConfigs = [
            this.generatePlotConfig(),
            this.generatePlotConfig(),
            this.generatePlotConfig(),
        ]

        this.mimetype = ['image/png', 'image/jpeg'][randomInt(0, 2)] as MimeType

        await this.realGrapher.generate({
            savePath: `src/__tests__/test.plot.png`,
            plotConfigs: this.plotConfigs,
        })
    }

    protected static async beforeEach() {
        await super.beforeEach()

        SubplotGrapher.Canvas = FakeChartJSNodeCanvas
        SubplotGrapher.sharp = fakeSharp

        this.fakeGrapher = this.SubplotGrapher()
        assert.isTruthy(this.fakeGrapher)
    }

    @test()
    protected static async canSetAndGetChartJSNodeCanvasClass() {
        SubplotGrapher.Canvas = FakeChartJSNodeCanvas
        assert.isEqual(SubplotGrapher.Canvas, FakeChartJSNodeCanvas)
    }

    @test()
    protected static async canSetAndGetSharpFunction() {
        SubplotGrapher.sharp = fakeSharp
        assert.isEqual(SubplotGrapher.sharp, fakeSharp)
    }

    @test()
    protected static async runCallsDependenciesAsRequired() {
        await this.run()

        assert.isLength(
            FakeChartJSNodeCanvas.constructorOptions,
            this.plotConfigs.length
        )

        for (const options of FakeChartJSNodeCanvas.constructorOptions) {
            assert.isEqualDeep(
                options,
                {
                    height: this.subplotHeight,
                    width: this.subplotWidth,
                },
                'ChartJSNodeCanvas constructor options do not match!'
            )
        }

        assert.isLength(
            FakeChartJSNodeCanvas.renderToBufferOptions,
            this.plotConfigs.length
        )

        for (let i = 0; i < this.plotConfigs.length; i++) {
            const actual = FakeChartJSNodeCanvas.renderToBufferOptions[i]
            const expected = {
                configuration: this.generateChartConfiguration(
                    this.plotConfigs[i]
                ),
                mimeType: this.mimetype,
            } as any

            //@ts-ignore
            delete actual.configuration.options.scales.x.ticks.callback
            delete expected.configuration.options.scales.x.ticks.callback

            assert.isEqualDeep(
                actual,
                expected,
                'Chart configuration does not match!'
            )
        }

        assert.isLength(FakeSharpTracker.sharpCalls, 1)
        assert.isEqualDeep(FakeSharpTracker.sharpCalls[0], {
            create: {
                width: this.subplotWidth,
                height: this.subplotHeight * this.expectedNumSubplots,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 1 },
            },
        })

        assert.isLength(FakeSharpTracker.compositeCalls, 1)

        const calledImages = FakeSharpTracker.compositeCalls[0]

        for (let i = 0; i < calledImages.length; i++) {
            const calledImage = calledImages[i]

            assert.doesInclude(calledImage, {
                top: this.subplotHeight * i,
                left: 0,
            })
            assert.isObject(calledImage.input)
        }

        assert.isLength(FakeSharpTracker.toFileCalls, 1)
        assert.isEqualDeep(FakeSharpTracker.toFileCalls[0], this.savePath)
    }

    @test()
    protected static async sortsTimestampsIfNotInOrder() {
        const plotConfig = {
            title: generateId(),
            datasets: [
                {
                    label: generateId(),
                    data: [
                        { x: '1', y: 1 },
                        { x: '3', y: 3 },
                        { x: '2', y: 2 },
                    ],
                    color: 'red',
                },
            ],
        } as any

        const chartConfig = this.generateChartConfiguration(plotConfig)

        const expected = [
            { x: '1', y: 1 },
            { x: '2', y: 2 },
            { x: '3', y: 3 },
        ] as any

        assert.isEqualDeep(chartConfig.data.datasets[0].data, expected)
    }

    private static generatePlotConfig() {
        return {
            title: generateId(),
            datasets: [
                this.generateDataset(1),
                this.generateDataset(2),
                this.generateDataset(3),
            ],
            verticalLines: this.generateRandomVerticalLines(),
        }
    }

    private static generateDataset(yMin: number) {
        const newLocal = {
            label: generateId(),
            data: Array.from({ length: this.numSamplesPerDataset }, (_, i) => {
                return { x: i.toString(), y: yMin + Math.random() }
            }) as any,
            color: this.randomColor(),
        }
        return newLocal
    }

    private static randomColor() {
        const options = ['red', 'blue', 'green', 'black', 'purple']
        return options[randomInt(0, options.length)]
    }

    private static generateChartConfiguration(plotConfig: PlotConfig) {
        const { title, datasets, verticalLines } = plotConfig

        return {
            type: 'line' as keyof ChartTypeRegistryType,
            data: {
                datasets: datasets.map(({ label, data, color }) => {
                    const sortedData = data.sort(
                        (a, b) => Number(a.x) - Number(b.x)
                    )

                    return {
                        label,
                        data: sortedData,
                        borderColor: color,
                        borderWidth: 1,
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

    private static generateRandomVerticalLines() {
        const numLines = randomInt(1, 5)
        const lines = []

        for (let i = 0; i < numLines; i++) {
            lines.push(randomInt(0, this.numSamplesPerDataset))
        }

        return lines
    }

    private static generateVerticalLineAnnotations(xValues: number[]) {
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

    private static get expectedNumSubplots() {
        return this.plotConfigs.length
    }

    private static async run() {
        await this.fakeGrapher.generate({
            savePath: this.savePath,
            plotConfigs: this.plotConfigs,
        })
    }

    private static get xAxisTicksCallback() {
        return (value: number, idx: number) => {
            const showLabelEveryXTicks = 5
            const shouldShowLabel = idx % showLabelEveryXTicks === 0
            return shouldShowLabel ? value : ''
        }
    }

    private static SubplotGrapher(options?: Partial<SubplotGrapherOptions>) {
        return SubplotGrapher.Create({
            subplotHeight: this.subplotHeight,
            subplotWidth: this.subplotWidth,
            mimeType: this.mimetype,
            ...options,
        })
    }
}
