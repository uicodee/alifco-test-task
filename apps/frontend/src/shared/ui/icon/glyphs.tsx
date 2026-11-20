import type { IconProps } from './brands';

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export function EyeIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" {...stroke} {...props}>
      <path d="M2.5 12c2.2-4.2 5.4-6.3 9.5-6.3s7.3 2.1 9.5 6.3c-2.2 4.2-5.4 6.3-9.5 6.3S4.7 16.2 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function EyeClosedIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" {...stroke} {...props}>
      <path d="M3 9.5c2.1 3 5.1 4.6 9 4.6s6.9-1.6 9-4.6" />
      <path d="m5.6 12.3-1.9 2.4M10 13.9l-.6 3M14 13.9l.6 3M18.4 12.3l1.9 2.4" />
    </svg>
  );
}

export function ContrastIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 3.8a8.2 8.2 0 0 1 0 16.4Z" fill="currentColor" />
    </svg>
  );
}
