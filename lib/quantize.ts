/**
 * 图像量化核心模块
 * Canvas 缩放 → 像素提取 → image-q CIEDE2000 量化 → 输出量化矩阵
 */
import * as iq from 'image-q';
import { ARTKAL_PALETTE, ARTKAL_SOLID_PALETTE, type ArtkalColor } from './artkal-palette';

export interface QuantizeConfig {
  width: number;
  height: number;
  maxColors: number;
  dithering: boolean;
  colorMode: 'color' | 'grayscale' | 'bw';
  useFullPalette: boolean;
}

export interface QuantizeResult {
matrix: ArtkalColor[][];
  colorStats: Map<string, number>;
  usedColors: ArtkalColor[];
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
 * 在 Artkal 色板中找到最近的颜色
 */
function findNearestArtkal(
  r: number, g: number, b: number,
  palette: ArtkalColor[]
): ArtkalColor {
  const [L, a, bv] = rgb2lab(r, g, b);
  let best: ArtkalColor = palette[0];
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
 * 使用 image-q 的 buildPaletteSync + applyPaletteSync 高级 API
 */
export async function quantizeImage(
  img: HTMLImageElement,
  config: QuantizeConfig
): Promise<QuantizeResult> {
  const { width, height, maxColors, dithering, colorMode, useFullPalette } = config;

  // 1. 缩放并提取像素
  let pixels = resizeAndExtract(img, width, height);

  // 2. 颜色模式预处理
  if (colorMode === 'grayscale') {
    pixels = toGrayscale(pixels);
  } else if (colorMode === 'bw') {
    pixels = toBW(pixels);
  }

  // 3. 确定色板
  const basePalette = useFullPalette ? ARTKAL_PALETTE : ARTKAL_SOLID_PALETTE;
  const effectiveMaxColors = maxColors > 0 ? Math.min(maxColors, basePalette.length) : basePalette.length;

  // 4. 用 image-q 提取主色调
  const pointContainer = iq.utils.PointContainer.fromUint8Array(pixels, width, height);

  // 建立减色色板 — 先用 image-q 找出 effectiveMaxColors 种代表色
  const internalPalette = iq.buildPaletteSync([pointContainer], {
    colorDistanceFormula: 'ciede2000',
    paletteQuantization: 'rgbquant',
    colors: effectiveMaxColors,
  });

  // 5. 将 image-q 色板映射到 Artkal 色板
  const internalPoints = internalPalette.getPointContainer().getPointArray();
  const usedArtkalSet = new Map<string, ArtkalColor>();

  for (const pt of internalPoints) {
    const nearest = findNearestArtkal(pt.r, pt.g, pt.b, basePalette);
    if (!usedArtkalSet.has(nearest.code)) {
      usedArtkalSet.set(nearest.code, nearest);
    }
  }
  const targetPalette = Array.from(usedArtkalSet.values());

// 6. 构建 Artkal 色板用于最终量化
  const artkalPaletteObj = new iq.utils.Palette();
  for (const color of targetPalette) {
    const pt = iq.utils.Point.createByRGBA(color.r, color.g, color.b, 255);
  artkalPaletteObj.add(pt);
  }

  // 7. 应用色板到图像
  const resultContainer = iq.applyPaletteSync(pointContainer, artkalPaletteObj, {
    colorDistanceFormula: 'ciede2000',
    imageQuantization: dithering ? 'floyd-steinberg' : 'nearest',
});

  // 8. 映射结果回 Artkal 颜色矩阵
  const resultPoints = resultContainer.getPointArray();
  const matrix: ArtkalColor[][] = [];
  const colorStats = new Map<string, number>();

  for (let y = 0; y < height; y++) {
    const row: ArtkalColor[] = [];
    for (let x = 0; x < width; x++) {
   const idx = y * width + x;
      const pt = resultPoints[idx];
      const artkalColor = findNearestArtkal(pt.r, pt.g, pt.b, targetPalette);
      row.push(artkalColor);
      colorStats.set(artkalColor.code, (colorStats.get(artkalColor.code) || 0) + 1);
    }
    matrix.push(row);
  }

  // 9. 统计
  const usedColors = targetPalette.filter((c) => colorStats.has(c.code));
  usedColors.sort((a, b) => (colorStats.get(b.code) || 0) - (colorStats.get(a.code) || 0));

  return {
    matrix,
    colorStats,
    usedColors,
    totalBeads: width * height,
    width,
    height,
  };
}
