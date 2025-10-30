import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const { default: annotationPlugin } = require('chartjs-plugin-annotation') as {
    default: (typeof import('chartjs-plugin-annotation'))['default']
}

export { annotationPlugin }
