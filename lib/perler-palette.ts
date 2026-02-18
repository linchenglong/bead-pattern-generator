/**
 * Perler Beads 色板数据 (~65色)
 * HEX 值整理自 beadifier 开源数据及 Perler 官方色卡
 * 导入时自动注册
 */
import { type BeadColor, makeBeadColor, registerPalette } from './palette-registry';

function p(code: string, name: string, hex: string, special = false): BeadColor {
  return makeBeadColor('perler', code, name, hex, special);
}

export const PERLER_PALETTE: BeadColor[] = [
  // ===== 基础色 =====
  p('P01', 'White', '#FFFFFF'),
  p('P02', 'Cream', '#F5E6C8'),
  p('P03', 'Yellow', '#FDD835'),
  p('P04', 'Orange', '#FB8C00'),
  p('P05', 'Red', '#E53935'),
  p('P06', 'Bubblegum', '#F48FB1'),
  p('P07', 'Purple', '#8E24AA'),
  p('P08', 'Dark Blue', '#1565C0'),
  p('P09', 'Light Blue', '#64B5F6'),
  p('P10', 'Dark Green', '#2E7D32'),
  p('P11', 'Light Green', '#66BB6A'),
  p('P12', 'Brown', '#6D4C41'),
  p('P13', 'Grey', '#9E9E9E'),
  p('P14', 'Black', '#212121'),

  // ===== 扩展色 =====
  p('P15', 'Peach', '#FFCCBC'),
  p('P16', 'Tan', '#D7CCC8'),
  p('P17', 'Magenta', '#D81B60'),
  p('P18', 'Neon Yellow', '#EEFF41', true),
  p('P19', 'Neon Orange', '#FF6D00', true),
  p('P20', 'Neon Green', '#76FF03', true),
  p('P21', 'Neon Pink', '#FF4081', true),
  p('P22', 'Pastel Blue', '#BBDEFB'),
  p('P23', 'Pastel Green', '#C8E6C9'),
  p('P24', 'Pastel Lavender', '#E1BEE7'),
  p('P25', 'Pastel Yellow', '#FFF9C4'),
  p('P26', 'Pastel Pink', '#F8BBD0'),
  p('P27', 'Cheddar', '#FFB300'),
  p('P28', 'Toothpaste', '#80DEEA'),
  p('P29', 'Hot Coral', '#FF5252'),
  p('P30', 'Plum', '#6A1B9A'),
  p('P31', 'Kiwi Lime', '#9CCC65'),
  p('P32', 'Cyan', '#00BCD4'),
  p('P33', 'Blueberry Cream', '#7986CB'),
  p('P34', 'Periwinkle Blue', '#5C6BC0'),
  p('P35', 'Rust', '#BF360C'),
  p('P36', 'Light Brown', '#A1887F'),
  p('P37', 'Sand', '#BCAAA4'),
  p('P38', 'Dark Grey', '#616161'),
  p('P39', 'Light Grey', '#BDBDBD'),
  p('P40', 'Raspberry', '#AD1457'),
  p('P41', 'Butterscotch', '#FFB74D'),
  p('P42', 'Parrot Green', '#388E3C'),
  p('P43', 'Dark Red', '#B71C1C'),
  p('P44', 'Robin Egg Blue', '#4DD0E1'),
  p('P45', 'Cobalt', '#283593'),
  p('P46', 'Turquoise', '#00897B'),
  p('P47', 'Midnight Blue', '#0D47A1'),
  p('P48', 'Fern', '#558B2F'),
  p('P49', 'Evergreen', '#1B5E20'),
  p('P50', 'Mist', '#CFD8DC'),
  p('P51', 'Prickly Pear', '#7CB342'),
  p('P52', 'Cranapple', '#C62828'),
  p('P53', 'Flamingo', '#F06292'),
  p('P54', 'Spice', '#E65100'),
  p('P55', 'Honey', '#F9A825'),
  p('P56', 'Lagoon', '#0097A7'),
  p('P57', 'Pewter', '#78909C'),
  p('P58', 'Cherry', '#D32F2F'),
  p('P59', 'Olive', '#827717'),
  p('P60', 'Sky', '#42A5F5'),
  p('P61', 'Slime', '#C0CA33'),
  p('P62', 'Salmon', '#FF8A80'),
  p('P63', 'Orchid', '#BA68C8'),
  p('P64', 'Candy Coral', '#FF80AB'),
  p('P65', 'Glow Green', '#B9F6CA', true),
];

// === 自动注册 ===
registerPalette('perler', PERLER_PALETTE);
