/**
 * Hama Midi Beads 色板数据 (~52色)
 * HEX 值整理自 beadifier 开源数据及 Hama 官方色卡
 * 导入时自动注册
 */
import { type BeadColor, makeBeadColor, registerPalette } from './palette-registry';

function h(code: string, name: string, hex: string, special = false): BeadColor {
  return makeBeadColor('hama', code, name, hex, special);
}

export const HAMA_PALETTE: BeadColor[] = [
  // ===== 基础色 =====
  h('H01', 'White', '#FFFFFF'),
  h('H02', 'Cream', '#F2E5BF'),
  h('H03', 'Yellow', '#FDD835'),
  h('H04', 'Orange', '#FB8C00'),
  h('H05', 'Red', '#E53935'),
  h('H06', 'Pink', '#F48FB1'),
  h('H07', 'Purple', '#8E24AA'),
  h('H08', 'Blue', '#1E88E5'),
  h('H09', 'Light Blue', '#64B5F6'),
  h('H10', 'Green', '#43A047'),
  h('H11', 'Light Green', '#81C784'),
  h('H12', 'Brown', '#795548'),
  h('H13', 'Grey', '#9E9E9E'),
  h('H14', 'Black', '#212121'),

  // ===== 扩展色 =====
  h('H15', 'Claret', '#880E4F'),
  h('H16', 'Burgundy', '#7B1FA2'),
  h('H17', 'Dark Red', '#C62828'),
  h('H18', 'Plum', '#6A1B9A'),
  h('H19', 'Light Pink', '#F8BBD0'),
  h('H20', 'Peach', '#FFAB91'),
  h('H21', 'Flesh', '#FFCCBC'),
  h('H22', 'Pastel Yellow', '#FFF9C4'),
  h('H23', 'Teddy Bear', '#A1887F'),
  h('H24', 'Tan', '#D7CCC8'),
  h('H25', 'Dark Green', '#1B5E20'),
  h('H26', 'Forest Green', '#2E7D32'),
  h('H27', 'Olive', '#827717'),
  h('H28', 'Dark Blue', '#0D47A1'),
  h('H29', 'Pastel Blue', '#BBDEFB'),
  h('H30', 'Azure', '#1565C0'),
  h('H31', 'Medium Blue', '#42A5F5'),
  h('H32', 'Light Grey', '#BDBDBD'),
  h('H33', 'Dark Grey', '#616161'),
  h('H34', 'Raspberry', '#AD1457'),
  h('H35', 'Turquoise', '#00897B'),
  h('H36', 'Fern Green', '#388E3C'),
  h('H37', 'Neon Yellow', '#EEFF41', true),
  h('H38', 'Neon Orange', '#FF6D00', true),
  h('H39', 'Neon Green', '#76FF03', true),
  h('H40', 'Neon Pink', '#FF4081'41', 'Neon 'H42', 'Past, true),
  h('HRed', '#FF1744', true),
  h(el Pink', '#FCE4EC'),
  h('H43', 'Pastel Lilac', '#E1BEE7'),
  h('H44', 'Pastel Mint', '#C8E6C9'),
  h('H45', 'Cyan', '#00BCD4'),
  h('H46', 'Ivory', '#FFF8E1'),
  h('H47', 'Gold', '#FFD600'),
  h('H48', 'Silver', '#B0BEC5'),
  h('H49', 'Bronze', '#8D6E63'),
  h('H50', 'Glow in Dark', '#E8F5E9', true),
  h('H51', 'Lavender', '#CE93D8'),
  h('H52', 'Sand', '#D7CCC8'),
];

// === 自动注册 ===
registerPalette('hama', HAMA_PALETTE);
