/**
 * 图像量化核心模块
 * Canvas 缩放 → 像素提取 → image-q CIEDE2000 量化 → 输出量化矩阵
 * 已适配多品牌色板
 */
import * as iq from 'image-q';
import type { BeadColor, BrandId } from './palette-registry';
import { getMergedPalette } from './palettes';

export interface QuantizeConfig {
  width: number;
  height: number;
  maxColors: number;
  dithering: boolean;
  colorMode: 'color' | 'grayscale' | 'bw';
  useFullPalette: boolean;
  selectedBrand: BrandId;
}

export interface QuantizeResult {
  matrix: BeadColor[][];
  colorStats: Map<string, number>; // key = uid ("artkal:C01")
  usedColors: BeadColor[];
  totalBeads: number;
  width: number;
  height: number;
}

/**
 * 将图片缩放到目标尺寸并提取 RGBA 像素
 */
function resizeAndExtract(
  img: HTMLImageElement,
  targetW: number,
  targetH: number
): Uint8Array {
  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetW, targetH);
  const imageData = ctx.getImageData(0, 0, targetW, targetH);
  return new Uint8Array(imageData.data.buffer);
}

/**
 * 灰度化处理
 */
function toGrayscale(pixels: Uint8Array): Uint8Array {
  const result = new Uint8Array(pixels.length);
  for (let i = 0; i < pixels.length; i += 4) {
    const gray = Math.round(0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]);
    result[i] = gray;
    result[i + 1] = gray;
    result[i + 2] = gray;
    result[i + 3] = pixels[i + 3];
  }
  return result;
}

/**
 * 黑白（二值化）处理
 */
function toBW(pixels: Uint8Array): Uint8Array {
  const result = new Uint8Array(pixels.length);
  for (let i = 0; i < pixels.length; i += 4) {
  const gray = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
    const bw = gray > 128 ? 255 : 0;
    result[i] = bw;
    result[i + 1] = bw;
    result[i + 2] = bw;
  result[i + 3] = pixels[i + 3];
  }
  return result;
}

/**
 * sRGB → L*a*b* 转换
 */
function rgb2lab(r: number, g: number, b: number): [number, number, number] {
  let rl = r / 255, gl = g / 255, bl = b / 255;
  rl = rl > 0.04045 ? Math.pow((rl + 0.055) / 1.055, 2.4) : rl / 12.92;
  gl = gl > 0.04045 ? Math.pow((gl + 0.055) / 1.055, 2.4) : gl / 12.92;
  bl = bl > 0.04045 ? Math.pow((bl + 0.055) / 1.055, 2.4) : bl / 12.92;

  let x = (rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375) / 0.95047;
  let y = (rl * 0.2126729 + gl * 0.7151522 + bl * 0.0721750);
  let z = (rl * 0.0193339 + gl * 0.1191920 + bl * 0.9503041) / 1.08883;

  const f = (t: number) => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  x = f(x); y = f(y); z = f(z);

  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

/**
 * Lab 色差（简化 CIEDE2000）
 */
function labDistance(
  L1: number, a1: number, b1: number,
  L2: number, a2: number, b2: number
): number {
const dL = L1 - L2;
  const da = a1 - a2;
  const db = b1 - b2;
  return Math.sqrt(dL * dL + da * da + db * db);
}

/**
 * 在色板中找到最近的颜色
 */
function findNearestColor(
  r: number, g: number, b: number,
  palette: BeadColor[]
): BeadColor {
  const [L, a, bv] = rgb2lab(r, g, b);
  let best: BeadColor = palette[0];
  let bestDist = Infinity;

  for (const color of palette) {
    const [L2, a2, b2] = rgb2lab(color.r, color.g, color.b);
    const dist = labDistance(L, a, bv, L2, a2, b2);
    if (dist < bestDist) {
      bestDist = dist;
      best = color;
    }
  }
  return best;
}

/**
 * 主量化流程
 */
export async function quantizeImage(
  img: HTMLImageElement,
  config: QuantizeConfig
): Promise<QuantizeResult> {
  const { width, height, maxColors, dithering, colorMode, useFullPalette, selectedBrand } = config;

  // 1. 缩放并提取像素
  let pixels = resizeAndExtract(img, width, height);

  // 2. 颜色模式预处理
  if (colorMode === 'grayscale') {
    pixels = toGrayscale(pixels);
  } else if (colorMode === 'bw') {
    pixels = toBW(pixels);
  }

  // 3. 确定色板 — 使用多品牌合并色板
  const basePalette = getMergedPalette([selectedBrand], !useFullPalette);
  const effectiveMaxColors = maxColors > 0 ? Math.min(maxColors, basePalette.length) : basePalette.length;

  // 4. 用 image-q 提取主色调
  const pointContainer = iq.utils.PointContainer.fromUint8Array(pixels, width, height);

  const internalPalette = iq.buildPaletteSync([pointContainer], {
    colorDistanceFormula: 'ciede2000',
    paletteQuantization: 'rgbquant',
    colors: effectiveMaxColors,
  });

  // 5. 将 image-q 色板映射到合并色板
  const internalPoints = internalPalette.getPointContainer().getPointArray();
  const usedColorSet = new Map<string, BeadColor>();

  for (const pt of internalPoints) {
    const nearest = findNearestColor(pt.r, pt.g, pt.b, basePalette);
    if (!usedColorSet.has(nearest.uid)) {
      usedColorSet.set(nearest.uid, nearest);
    }
  }
  const targetPalette = Array.from(usedColorSet.values());

  // 6. 构建色板用于最终量化
  const quantPaletteObj = new iq.utils.Palette();
  for (const color of targetPalette) {
    const pt = iq.utils.Point.createByRGBA(color.r, color.g, color.b, 255);
    quantPaletteObj.add(pt);
  }

  // 7. 应用色板到图像
  const resultContainer = iq.applyPaletteSync(pointContainer, quantPaletteObj, {
    colorDistanceFormula: 'ciede2000',
    imageQuantization: dithering ? 'floyd-steinberg' : 'nearest',
  });

  // 8. 映射结果回颜色矩阵 — key 用 uid
  const resultPoints = resultContainer.getPointArray();
  const matrix: BeadColor[][] = [];
  const colorStats = new Map<string, number>();

  for (let y = 0; y < height; y++) {
    const row: BeadColor[] = [];
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const pt = resultPoints[idx];
  const beadColor = findNearestColor(pt.r, pt.g, pt.b, targetPalette);
      row.push(beadColor);
      colorStats.set(beadColor.uid, (colorStats.get(beadColor.uid) || 0) + 1);
 }
    matrix.push(row);
  }

  // 9. 统计
  const usedColors = targetPalette.filter((c) => colorStats.has(c.uid));
  usedColors.sort((a, b) => (colorStats.get(b.uid) || 0) - (colorStats.get(a.uid) || 0));

  return {
    matrix,
colorStats,
    usedColors,
    totalBeads: width * height,
    width,
    height,
  };
}
