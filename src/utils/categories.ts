import type React from 'react';
import {
  CircleAlert,
  Droplets,
  Flame,
  Leaf,
  Radiation,
  Trash2,
  Trees,
  TriangleAlert,
  Wind,
  Wrench,
} from '@tamagui/lucide-icons-2';

export type IconComponent = React.ComponentType<{ size?: number; color?: string }>;

export function getCategoryStyle(nome: string): { Icon: IconComponent; color: string } {
  const n = nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (n.includes('alagamento') || n.includes('enchente') || n.includes('inundacao'))
    return { Icon: Droplets, color: '#1565c0' };
  if (n.includes('arvore') || n.includes('vegeta') || n.includes('galho'))
    return { Icon: Leaf, color: '#388e3c' };
  if (n.includes('buraco') || n.includes('calcada') || n.includes('estrada') || n.includes('via'))
    return { Icon: Wrench, color: '#e65100' };
  if (n.includes('lixo') || n.includes('entulho') || n.includes('descarte'))
    return { Icon: Trash2, color: '#6a1b9a' };
  if (n.includes('deslizamento') || n.includes('erosao'))
    return { Icon: TriangleAlert, color: '#795548' };
  if (n.includes('queimada') || n.includes('incendio'))
    return { Icon: Flame, color: '#bf360c' };
  if (n.includes('poluicao'))
    return { Icon: Wind, color: '#37474f' };
  if (n.includes('desmatamento'))
    return { Icon: Trees, color: '#21952f' };
  if (n.includes('esgoto'))
    return { Icon: Radiation, color: '#849521' };
  return { Icon: CircleAlert, color: '#37474f' };
}

export const STATUS_LABEL: Record<string, string> = {
  aberta: 'Aberta',
  em_analise: 'Em análise',
  resolvida: 'Resolvida',
};

export const STATUS_BG: Record<string, string> = {
  aberta: '#ffebee',
  em_analise: '#fff3e0',
  resolvida: '#e8f5e9',
};

export const STATUS_FG: Record<string, string> = {
  aberta: '#c62828',
  em_analise: '#e65100',
  resolvida: '#2e7d32',
};
