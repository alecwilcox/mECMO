import * as React from 'react';

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function Switch({ checked = false, onCheckedChange, ...props }: SwitchProps) {
  return (
    <input
      type="checkbox"
      role="switch"
      checked={!!checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      className="h-5 w-10 cursor-pointer appearance-none rounded-full bg-gray-300 transition-colors outline-none
                 checked:bg-black relative
                 before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-transform
                 checked:before:translate-x-5"
      {...props}
    />
  );
}
