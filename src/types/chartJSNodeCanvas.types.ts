import { Readable } from 'stream'
import { ChartConfiguration } from 'chart.js'
import { ChartJSNodeCanvasOptions, MimeType } from 'chartjs-node-canvas'

export interface IChartJSNodeCanvas {
	/**
	 * Render to a data URL.
	 * @param configuration The Chart JS configuration for the chart to render.
	 * @param mimeType The image format, `image/png` or `image/jpeg`.
	 */
	renderToDataURL(
		configuration: ChartConfiguration,
		mimeType?: MimeType
	): Promise<string>

	/**
	 * Render to a data URL synchronously.
	 * @param configuration The Chart JS configuration for the chart to render.
	 * @param mimeType The image format, `image/png` or `image/jpeg`.
	 */
	renderToDataURLSync(
		configuration: ChartConfiguration,
		mimeType?: MimeType
	): string

	/**
	 * Render to a buffer.
	 * @param configuration The Chart JS configuration for the chart to render.
	 * @param mimeType A string indicating the image format.
	 */
	renderToBuffer(
		configuration: ChartConfiguration,
		mimeType?: MimeType
	): Promise<Buffer>

	/**
	 * Render to a buffer synchronously.
	 * @param configuration The Chart JS configuration for the chart to render.
	 * @param mimeType A string indicating the image format.
	 */
	renderToBufferSync(
		configuration: ChartConfiguration,
		mimeType?: MimeType | 'application/pdf' | 'image/svg+xml'
	): Buffer

	/**
	 * Render to a stream.
	 * @param configuration The Chart JS configuration for the chart to render.
	 * @param mimeType A string indicating the image format.
	 */
	renderToStream(
		configuration: ChartConfiguration,
		mimeType?: MimeType | 'application/pdf'
	): Readable

	/**
	 * Register a font with Canvas to use a font file that is not installed as a system font.
	 *
	 * @param path The path to the font file.
	 * @param options The font options.
	 */
	registerFont(
		path: string,
		options: {
			readonly family: string
			readonly weight?: string
			readonly style?: string
		}
	): void
}

export type ChartJSNodeCanvasClass = new (
	options: ChartJSNodeCanvasOptions
) => IChartJSNodeCanvas

export interface RenderToBufferOptions {
	configuration: ChartConfiguration
	mimeType?: MimeType
}
