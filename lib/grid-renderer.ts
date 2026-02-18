/**
 * 网格图纸渲染器
 * 用 Canvas 绘制带颜色编号的拼豆图纸
 */
import type { ArtkalColor } from './artkal-palette';
import type { QuantizeResult } from './quantize';

export interface GridRenderOptions {
  cellSize?: number;     // 每格像素大小（默认 40）
  showLabels?: boolean;  // 是否显示色号标注
  showGridLines?: boolean; // 是否显示网格线
  showRowColNumbers?: boolean; // 是否显示行列号
  labelFontSize?: number; // 标注字体大小
  headerSize?: number;    // 行列号预留空间
}

const DEFAULT_OPTIONS: Required<GridRenderOptions> = {
  cellSize: 40,
  showLabels: true,
  showGridLines: true,
  showRowColNumbers: true,
  labelFontSize: 0, // 0 表示自动计算
  headerSize: 30,
};

/**
 * 判断颜色明暗，决定标注文字颜色
 */
function isLightColor(r: number, g: number, b: number): boolean {
  return (0.299 * r + 0.587 * g + 0.114 * b) > 140;
}

/**
 * 渲染像素预览图（无网格线/编号，纯色块）
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
 * 渲染完整网格图纸（带编号、行列号、网格线）
 */
export function renderGridPattern(
  result: QuantizeResult,
  options: GridRenderOptions = {}
): HTMLCanvasElement {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const {
    cellSize,
    showLabels,
    showGridLines,
  showRowColNumbers,
    headerSize,
  } = opts;

  // 自动计算字体大小
  const fontSize = opts.labelFontSize > 0
    ? opts.labelFontSize
    : Math.max(8, Math.floor(cellSize * 0.28));

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

  // 绘制行列号
  if (showRowColNumbers) {
    ctx.fillStyle = '#333';
    ctx.font = `bold ${Math.floor(headerSize * 0.5)}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 列号
    for (let x = 0; x < result.width; x++) {
      ctx.fillText(
        String(x + 1),
  offsetX + x * cellSize + cellSize / 2,
    offsetY / 2
      );
    }
    // 行号
    for (let y = 0; y < result.height; y++) {
      ctx.fillText(
        String(y + 1),
        offsetX / 2,
        offsetY + y * cellSize + cellSize / 2
      );
    }
  }

  // 绘制色块
  for (let y = 0; y < result.height; y++) {
    for (let x = 0; x < result.width; x++) {
      const color = result.matrix[y][x];
      const px = offsetX + x * cellSize;
    const py = offsetY + y * cellSize;

      // 填充颜色
      ctx.fillStyle = color.hex;
    ctx.fillRect(px, py, cellSize, cellSize);

    // 网格线
      if (showGridLines) {
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(px, py, cellSize, cellSize);
      }

      // 色号标注
      if (showLabels && cellSize >= 20) {
        const textColor = isLightColor(color.r, color.g, color.b) ? '#222' : '#FFF';
        ctx.fillStyle = textColor;
    ctx.font = `${fontSize}px Arial, sans-serif`;
        ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

        // 提取纯数字编号以节省空间
        const label = color.code.replace('C', '');
ctx.fillText(label, px + cellSize / 2, py + cellSize / 2);
      }
    }
  }

  // 每 5 行/列加粗线，方便对照
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
 * 生成用料清单文本
 */
export function generateMaterialText(result: QuantizeResult): string {
  const lines: string[] = [];
  lines.push('========== 拼豆用料清单 ==========');
  lines.push(`尺寸: ${result.width} × ${result.height}`);
  lines.push(`总豆数: ${result.totalBeads} 颗`);
  lines.push(`使用颜色: ${result.usedColors.length} 种`);
  lines.push('----------------------------------');
  lines.push('色号      颜色名称      数量');
  lines.push('----------------------------------');

  for (const color of result.usedColors) {
    const count = result.colorStats.get(color.code) || 0;
  const code = color.code.padEnd(10);
    const name = color.name.padEnd(10);
    lines.push(`${code}${name}${count} 颗`);
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
