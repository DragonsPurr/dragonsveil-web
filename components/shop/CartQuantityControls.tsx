'use client';

import { BoxIcon } from '@/components/icons/BoxIcon';
import {
  boxiconsMinusSquare,
  boxiconsMinusSquareFilled,
  boxiconsPlusSquare,
  boxiconsPlusSquareFilled,
} from '@/components/icons/boxicons-cart';
import type { IconifyIcon } from '@iconify/types';

type CartQuantityControlsProps = {
  lineId: string;
  quantity: number;
  pending?: boolean;
  onQuantity: (lineId: string, quantity: number) => void;
  decreaseLabel: string;
  increaseLabel: string;
  size?: 'sm' | 'md';
};

function QuantityIconButton({
  icon,
  filledIcon,
  label,
  disabled,
  onClick,
  buttonClass,
  iconSize,
}: {
  icon: IconifyIcon;
  filledIcon: IconifyIcon;
  label: string;
  disabled?: boolean;
  onClick: () => void;
  buttonClass: string;
  iconSize: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className={`group inline-flex items-center justify-center text-[var(--dp-light-red)] disabled:opacity-50 ${buttonClass}`}
    >
      <BoxIcon icon={icon} width={iconSize} height={iconSize} className="group-hover:hidden group-focus-visible:hidden" />
      <BoxIcon
        icon={filledIcon}
        width={iconSize}
        height={iconSize}
        className="hidden group-hover:block group-focus-visible:block"
      />
    </button>
  );
}

export function CartQuantityControls({
  lineId,
  quantity,
  pending = false,
  onQuantity,
  decreaseLabel,
  increaseLabel,
  size = 'md',
}: CartQuantityControlsProps) {
  const buttonClass = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9';
  const iconSize = size === 'sm' ? '1.125rem' : '1.35rem';
  const quantityClass =
    size === 'sm'
      ? 'font-cinzel text-sm w-6 text-center tabular-nums'
      : 'font-cinzel w-8 text-center tabular-nums';

  return (
    <div className={`flex items-center ${size === 'sm' ? 'gap-1.5' : 'gap-2'}`}>
      <QuantityIconButton
        icon={boxiconsMinusSquare}
        filledIcon={boxiconsMinusSquareFilled}
        label={decreaseLabel}
        disabled={pending}
        onClick={() => onQuantity(lineId, quantity - 1)}
        buttonClass={buttonClass}
        iconSize={iconSize}
      />
      <span className={quantityClass}>{quantity}</span>
      <QuantityIconButton
        icon={boxiconsPlusSquare}
        filledIcon={boxiconsPlusSquareFilled}
        label={increaseLabel}
        disabled={pending}
        onClick={() => onQuantity(lineId, quantity + 1)}
        buttonClass={buttonClass}
        iconSize={iconSize}
      />
    </div>
  );
}
