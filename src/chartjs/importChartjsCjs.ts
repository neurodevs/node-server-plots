import { createRequire } from 'module'
const require = createRequire(import.meta.url)

import type {
    Chart as ChartType,
    ChartConfiguration as ChartConfigurationType,
    ChartTypeRegistry as ChartTypeRegistryType,
    ScatterDataPoint as ScatterDataPointType,
} from 'chart.js'

const {
    Chart,
    ChartConfiguration,
    ChartTypeRegistry,
    ScatterDataPoint,
} = require('chart.js')

export {
    Chart,
    ChartConfiguration,
    ChartTypeRegistry,
    ScatterDataPoint,
    ChartType,
    ChartConfigurationType,
    ChartTypeRegistryType,
    ScatterDataPointType,
}
