import type { IconifyIcon } from '@iconify/types';

/** From https://icon-sets.iconify.design/boxicons/ (bundled to avoid shipping the full set). */
const size = { width: 24, height: 24 } as const;

export const boxiconsCart: IconifyIcon = {
  ...size,
  body: '<path fill="currentColor" d="M21 6H7.05L5.94 2.68A1 1 0 0 0 4.99 2h-3v2h2.28l3.54 10.63A2 2 0 0 0 9.71 16h7.59a2 2 0 0 0 1.87-1.3l2.76-7.35c.11-.31.07-.65-.11-.92A1 1 0 0 0 21 6m-3.69 8H9.72l-2-6h11.84zM10 18a2 2 0 1 0 0 4a2 2 0 1 0 0-4m7 0a2 2 0 1 0 0 4a2 2 0 1 0 0-4"/>',
};

export const boxiconsCartFilled: IconifyIcon = {
  ...size,
  body: '<path fill="currentColor" d="M21 6H7.05L5.94 2.68A1 1 0 0 0 4.99 2h-3v2h2.28l3.54 10.63A2 2 0 0 0 9.71 16h7.59a2 2 0 0 0 1.87-1.3l2.76-7.35A.997.997 0 0 0 21 6M10 18a2 2 0 1 0 0 4a2 2 0 1 0 0-4m7 0a2 2 0 1 0 0 4a2 2 0 1 0 0-4"/>',
};

export const boxiconsUserCircle: IconifyIcon = {
  ...size,
  body: '<path fill="currentColor" d="M12 6c-2.28 0-4 1.72-4 4s1.72 4 4 4s4-1.72 4-4s-1.72-4-4-4m0 6c-1.18 0-2-.82-2-2s.82-2 2-2s2 .82 2 2s-.82 2-2 2"/><path fill="currentColor" d="M12 2C6.49 2 2 6.49 2 12c0 3.26 1.58 6.16 4 7.98V20h.03c1.67 1.25 3.73 2 5.97 2s4.31-.75 5.97-2H18v-.02c2.42-1.83 4-4.72 4-7.98c0-5.51-4.49-10-10-10M8.18 19.02C8.59 17.85 9.69 17 11 17h2c1.31 0 2.42.85 2.82 2.02c-1.14.62-2.44.98-3.82.98s-2.69-.35-3.82-.98m9.3-1.21c-.81-1.66-2.51-2.82-4.48-2.82h-2c-1.97 0-3.66 1.16-4.48 2.82A7.96 7.96 0 0 1 4 11.99c0-4.41 3.59-8 8-8s8 3.59 8 8c0 2.29-.97 4.36-2.52 5.82"/>',
};

export const boxiconsUserCircleFilled: IconifyIcon = {
  ...size,
  body: '<path fill="currentColor" d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10s10-4.49 10-10S17.51 2 12 2m0 5c1.73 0 3 1.27 3 3s-1.27 3-3 3s-3-1.27-3-3s1.27-3 3-3m0 13a7.98 7.98 0 0 1-5.48-2.18C7.33 16.16 9.03 15 11 15h2c1.97 0 3.66 1.16 4.47 2.82A7.94 7.94 0 0 1 12 20"/>',
};

export const boxiconsPlusSquare: IconifyIcon = {
  ...size,
  body: '<path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2M5 19V5h14v14z"/><path fill="currentColor" d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4z"/>',
};

export const boxiconsPlusSquareFilled: IconifyIcon = {
  ...size,
  body: '<path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4z"/>',
};

export const boxiconsMinusSquare: IconifyIcon = {
  ...size,
  body: '<path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2M5 19V5h14v14z"/><path fill="currentColor" d="M7 11h10v2H7z"/>',
};

export const boxiconsMinusSquareFilled: IconifyIcon = {
  ...size,
  body: '<path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-2 10H7v-2h10z"/>',
};

export const boxiconsArrowBigLeft: IconifyIcon = {
  ...size,
  body: '<path fill="currentColor" d="M21 8h-7V4a1.004 1.004 0 0 0-1.63-.78l-9.99 8c-.24.19-.38.48-.38.78s.14.59.38.78l10 8c.18.14.4.22.62.22c.15 0 .3-.03.43-.1c.35-.17.57-.52.57-.9v-4h7c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1m-1 6h-7c-.55 0-1 .45-1 1v2.92L4.6 12L12 6.08V9c0 .55.45 1 1 1h7z"/>',
};

export const boxiconsArrowBigLeftFilled: IconifyIcon = {
  ...size,
  body: '<path fill="currentColor" d="M21 8h-7V4a1.004 1.004 0 0 0-1.63-.78l-9.99 8c-.24.19-.38.48-.38.78s.14.59.38.78l10 8c.18.14.4.22.62.22c.15 0 .3-.03.43-.1c.35-.17.57-.52.57-.9v-4h7c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1"/>',
};

export const boxiconsArrowBigRight: IconifyIcon = {
  ...size,
  body: '<path fill="currentColor" d="M11.62 3.22A1.004 1.004 0 0 0 9.99 4v4H3c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h7v4a1.004 1.004 0 0 0 1 1c.22 0 .44-.07.62-.22l10-8c.24-.19.38-.48.38-.78s-.14-.59-.38-.78zm.38 14.7V15c0-.55-.45-1-1-1H4v-4h7c.55 0 1-.45 1-1V6.08L19.4 12z"/>',
};

export const boxiconsArrowBigRightFilled: IconifyIcon = {
  ...size,
  body: '<path fill="currentColor" d="M11.62 3.22A1.004 1.004 0 0 0 9.99 4v4H3c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h7v4a1.004 1.004 0 0 0 1 1c.22 0 .44-.07.62-.22l10-8c.24-.19.38-.48.38-.78s-.14-.59-.38-.78z"/>',
};
