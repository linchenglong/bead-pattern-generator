/**
 * 色板统一入口
 * 副作用导入：触发各品牌色板自注册到全局 registry
 */
import './artkal-palette';
import './perler-palette';
import './hama-palette';

// 重新导出 registry 接口供外部使用
export { getMergedPalette, getPalette, getRegisteredBrands } from './palette-registry';
export type { BeadColor, BrandId } from './palette-registry';
