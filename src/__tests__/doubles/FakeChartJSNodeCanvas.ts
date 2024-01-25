import { Readable } from 'stream'
import { ChartConfiguration } from 'chart.js'
import { ChartJSNodeCanvasOptions, MimeType } from 'chartjs-node-canvas'
import {
	IChartJSNodeCanvas,
	RenderToBufferOptions,
} from '../../types/chartJSNodeCanvas.types'

export default class FakeChartJSNodeCanvas implements IChartJSNodeCanvas {
	public static constructorOptions: ChartJSNodeCanvasOptions[] = []
	public static renderToBufferOptions: RenderToBufferOptions[] = []

	public constructor(options: ChartJSNodeCanvasOptions) {
		FakeChartJSNodeCanvas.constructorOptions?.push(options)
	}

	public async renderToDataURL(
		_configuration: ChartConfiguration,
		_mimeType?: MimeType
	): Promise<string> {
		return ''
	}

	public renderToDataURLSync(
		_configuration: ChartConfiguration,
		_mimeType?: MimeType
	): string {
		return ''
	}

	public async renderToBuffer(
		configuration: ChartConfiguration,
		mimeType?: MimeType
	): Promise<Buffer> {
		FakeChartJSNodeCanvas.renderToBufferOptions.push({
			configuration,
			mimeType,
		})
		return {} as Buffer
	}

	public renderToBufferSync(
		_configuration: ChartConfiguration,
		_mimeType?: MimeType | 'application/pdf' | 'image/svg+xml'
	): Buffer {
		return {} as Buffer
	}

	public renderToStream(
		_configuration: ChartConfiguration,
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
