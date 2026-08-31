import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

const { default: annotationPlugin } = require('chartjs-plugin-annotation') as {
    default: (typeof import('chartjs-plugin-annotation'))['default']
}

export { annotationPlugin }
