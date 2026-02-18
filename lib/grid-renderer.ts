/**
 * 网格图纸渲染器
 * 用 Canvas 绘制带颜色编号的拼豆图纸
 * 已适配多品牌 BeadColor
 */
import type { BeadColor } from './palette-registry';
import type { QuantizeResult } from './quantize';

export interface GridRenderOptions {
  cellSize?: number;
  showLabels?: boolean;
  showGridLines?: boolean;
  showRowColNumbers?: boolean;
  labelFontSize?: number;
  headerSize?: number;
}

const DEFAULT_OPTIONS: Required<GridRenderOptions> = {
  cellSize: 40,
  showLabels: true,
showGridLines: true,
  showRowColNumbers: true,
  labelFontSize: 0,
  headerSize: 30,
};

function isLightColor(r: number, g: number, b: number): boolean {
  return (0.299 * r + 0.587 * g + 0.114 * b) > 140;
}

/**
 * 从 BeadColor 中提取简短标注
 * 单品牌时去前缀以节省空间，多品牌则保留完整色号避免歧义
 */
function getColorLabel(color: BeadColor, multiBrand: boolean): string {
  if (!multiBrand) {
    return color.code.replace(/^[A-Za-z]+/, '');
  }
  return color.code;
}

/**
 * 渲染像素预览图
 */
export function renderPixelPreview(
  result: QuantizeResult,
  scale: number = 10
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = result.width * scale;
  canvas.height = result.height * scale;
  const ctx = canvas.getContext('2d')!;

  for (let y = 0; y < result.height; y++) {
    for (let x = 0; x < result.width; x++) {
      const color = result.matrix[y][x];
      ctx.fillStyle = color.hex;
   ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  }
  return canvas;
}

/**
 * 检测结果中是否包含多个品牌
 */
function isMultiBrand(result: QuantizeResult): boolean {
  const brands = new Set(result.usedColors.map((c) => c.brand));
  return brands.size > 1;
}

/**
 * 渲染完整网格图纸
 */
export function renderGridPattern(
  result: QuantizeResult,
  options: GridRenderOptions = {}
): HTMLCanvasElement {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { cellSize, showLabels, showGridLines, showRowColNumbers, headerSize } = opts;
  const multiBrand = isMultiBrand(result);

  const fontSize = opts.labelFontSize > 0
    ? opts.labelFontSize
    : Math.max(8, Math.floor(cellSize * (multiBrand ? 0.22 : 0.28)));

  const offsetX = showRowColNumbers ? headerSize : 0;
  const offsetY = showRowColNumbers ? headerSize : 0;
  const totalW = offsetX + result.width * cellSize;
  const totalH = offsetY + result.height * cellSize;

  const canvas = document.createElement('canvas');
  canvas.width = totalW;
  canvas.height = totalH;
  const ctx = canvas.getContext('2d')!;

  // 白底
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, totalW, totalH);

  // 行列号
  if (showRowColNumbers) {
    ctx.fillStyle = '#333';
    ctx.font = `bold ${Math.floor(headerSize * 0.5)}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let x = 0; x < result.width; x++) {
      ctx.fillText(String(x + 1), offsetX + x * cellSize + cellSize / 2, offsetY / 2);
    }
    for (let y = 0; y < result.height; y++) {
      ctx.fillText(String(y + 1), offsetX / 2, offsetY + y * cellSize + cellSize / 2);
    }
  }

  // 色块
  for (let y = 0; y < result.height; y++) {
    for (let x = 0; x < result.width; x++) {
      const color = result.matrix[y][x];
      const px = offsetX + x * cellSize;
   const py = offsetY + y * cellSize;

      ctx.fillStyle = color.hex;
      ctx.fillRect(px, py, cellSize, cellSize);

      if (showGridLines) {
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 0.5;
    ctx.strokeRect(px, py, cellSize, cellSize);
 }

  if (showLabels && cellSize >= 20) {
        const textColor = isLightColor(color.r, color.g, color.b) ? '#222' : '#FFF';
        ctx.fillStyle = textColor;
        ctx.font = `${fontSize}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
  const label = getColorLabel(color, multiBrand);
        ctx.fillText(label, px + cellSize / 2, py + cellSize / 2);
  }
    }
  }

  // 每 5 行/列加粗线
  if (showGridLines) {
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 1.5;
    for (let x = 0; x <= result.width; x += 5) {
      const px = offsetX + x * cellSize;
      ctx.beginPath();
      ctx.moveTo(px, offsetY);
      ctx.lineTo(px, offsetY + result.height * cellSize);
      ctx.stroke();
    }
    for (let y = 0; y <= result.height; y += 5) {
      const py = offsetY + y * cellSize;
      ctx.beginPath();
    ctx.moveTo(offsetX, py);
   ctx.lineTo(offsetX + result.width * cellSize, py);
      ctx.stroke();
  }

    // 外边框
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(offsetX, offsetY, result.width * cellSize, result.height * cellSize);
  }

  return canvas;
}

/**
 * 生成用料清单文本（含品牌列）
 */
export function generateMaterialText(result: QuantizeResult): string {
  const lines: string[] = [];
  const multiBrand = isMultiBrand(result);

  lines.push('========== 拼豆用料清单 ==========');
  lines.push(`尺寸: ${result.width} × ${result.height}`);
  lines.push(`总豆数: ${result.totalBeads} 颗`);
  lines.push(`使用颜色: ${result.usedColors.length} 种`);
  lines.push('----------------------------------');

  if (multiBrand) {
    lines.push('品牌      色号      颜色名称      数量');
  } else {
    lines.push('色号      颜色名称      数量');
  }
  lines.push('----------------------------------');

  for (const color of result.usedColors) {
    const count = result.colorStats.get(color.uid) || 0;
    if (multiBrand) {
      const brand = color.brand.padEnd(10);
      const code = color.code.padEnd(10);
      const name = color.name.padEnd(10);
      lines.push(`${brand}${code}${name}${count} 颗`);
    } else {
    const code = color.code.padEnd(10);
      const name = color.name.padEnd(10);
    lines.push(`${code}${name}${count} 颗`);
    }
  }

  lines.push('==================================');
return lines.join('\n');
}

/**
 * Canvas 转 Blob (PNG)
 */
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas toBlob failed'));
    }, 'image/png');
  });
}
