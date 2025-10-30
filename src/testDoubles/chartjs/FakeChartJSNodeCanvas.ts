import { Readable } from 'stream'
import { ChartJSNodeCanvasOptions, MimeType } from 'chartjs-node-canvas'

import { ChartConfigurationType } from '../../chartjs/importChartjsCjs.js'
import {
    IChartJSNodeCanvas,
    RenderToBufferOptions,
} from '../../types/chartJSNodeCanvas.types.js'

export default class FakeChartJSNodeCanvas implements IChartJSNodeCanvas {
    public static constructorOptions: ChartJSNodeCanvasOptions[] = []
    public static renderToBufferOptions: RenderToBufferOptions[] = []

    public constructor(options: ChartJSNodeCanvasOptions) {
        FakeChartJSNodeCanvas.constructorOptions?.push(options)
    }

    public async renderToDataURL(
        _configuration: ChartConfigurationType,
        _mimeType?: MimeType
    ): Promise<string> {
        return ''
    }

    public renderToDataURLSync(
        _configuration: ChartConfigurationType,
        _mimeType?: MimeType
    ): string {
        return ''
    }

    public async renderToBuffer(
        configuration: ChartConfigurationType,
        mimeType?: MimeType
    ): Promise<Buffer> {
        FakeChartJSNodeCanvas.renderToBufferOptions.push({
            configuration,
            mimeType,
        })
        return {} as Buffer
    }

    public renderToBufferSync(
        _configuration: ChartConfigurationType,
        _mimeType?: MimeType | 'application/pdf' | 'image/svg+xml'
    ): Buffer {
        return {} as Buffer
    }

    public renderToStream(
        _configuration: ChartConfigurationType,
        _mimeType?: MimeType | 'application/pdf'
    ): Readable {
        return {} as Readable
    }

    public registerFont(
        _path: string,
        _options: {
            readonly family: string
            readonly weight?: string
            readonly style?: string
        }
    ): void {}
}
