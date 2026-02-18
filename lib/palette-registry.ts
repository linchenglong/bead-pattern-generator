/**
 * 统一拼豆色板注册表
 * 支持多品牌色板合并
 */

export type BrandId = 'artkal' | 'perler' | 'hama';

export interface BeadColor {
  brand: BrandId;
  code: string;      // 品牌内色号 "C01" / "P01" / "H01"
  uid: string;// 全局唯一 "artkal:C01"
  name: string;
  hex: string;
  r: number;
  g: number;
  b: number;
  special?: boolean; // 荧光/夜光/透明
}

/** 全局色板注册表：brand → BeadColor[] */
const registry = new Map<BrandId, BeadColor[]>();

/** 注册一个品牌的色板 */
export function registerPalette(brand: BrandId, colors: BeadColor[]): void {
  registry.set(brand, colors);
}

/** 获取单个品牌色板 */
export function getPalette(brand: BrandId): BeadColor[] {
  return registry.get(brand) ?? [];
}

/** 获取所有已注册品牌 */
export function getRegisteredBrands(): BrandId[] {
  return Array.from(registry.keys());
}

/**
 * 合并多品牌色板
 * @param brands 选中的品牌列表
 * @param solidOnly 是否排除特殊色（荧光/夜光/透明）
 */
export function getMergedPalette(brands: BrandId[], solidOnly: boolean): BeadColor[] {
  const merged: BeadColor[] = [];
  for (const brand of brands) {
    const palette = registry.get(brand);
    if (palette) {
      merged.push(...palette);
    }
  }
  if (solidOnly) {
    return merged.filter((c) => !c.special);
  }
  return merged;
}

/**
 * 工具函数：hex → rgb
 */
export function hex2rgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
 g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

/**
 * 便捷构建器
 */
export function makeBeadColor(
  brand: BrandId,
  code: string,
  name: string,
  hex: string,
  special?: boolean
): BeadColor {
  const { r, g, b } = hex2rgb(hex);
  return {
    brand,
    code,
    uid: `${brand}:${code}`,
    name,
    hex,
    r,
    g,
    b,
    special: special ?? false,
  };
}
