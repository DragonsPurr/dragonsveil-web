'use client';

import { BoxIcon } from '@/components/icons/BoxIcon';
import type { IconifyIcon } from '@iconify/types';
import type { MouseEventHandler } from 'react';

type BoxIconHoverButtonProps = {
  icon: IconifyIcon;
  filledIcon: IconifyIcon;
  label: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  iconSize?: string;
};

export function BoxIconHoverButton({
  icon,
  filledIcon,
  label,
  disabled = false,
  onClick,
  className = '',
  iconSize = '2rem',
}: BoxIconHoverButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className={`group inline-flex items-center justify-center text-[var(--dp-light-red)] disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      <BoxIcon
        icon={icon}
        width={iconSize}
        height={iconSize}
        className={disabled ? undefined : 'group-hover:hidden group-focus-visible:hidden'}
      />
      <BoxIcon
        icon={filledIcon}
        width={iconSize}
        height={iconSize}
        className={
          disabled ? 'hidden' : 'hidden group-hover:block group-focus-visible:block'
        }
      />
    </button>
  );
}
