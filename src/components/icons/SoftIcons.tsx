import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

function iconProps(size: number, props: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    ...props,
  };
}

export function AppLogoIcon({ size = 44, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="2.5" y="2.5" width="39" height="39" rx="12" fill="#F8F6F2" stroke="#D9C99F" strokeWidth="1.6" />
      <path d="M12.5 11.2C18.7 7.8 28.7 8.2 32.2 13.5" stroke="#34483C" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M13.8 30.3C19 34.2 27.8 34 31.5 28.5" stroke="#34483C" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16.2 17.1V21.2" stroke="#34483C" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M28 16.7V20.9" stroke="#34483C" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M16.2 27.5C19.4 30 24.6 29.7 27.7 26.5" stroke="#34483C" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M10.6 25.9C14.2 23.9 15.7 21 14.7 17.8C10.8 18 7.9 20.1 6.8 23.5C7.6 25.5 8.9 26.3 10.6 25.9Z" fill="#34483C" opacity="0.92" />
      <path d="M29.6 29.7C30.4 25 33.3 22.8 36.9 22.4C36.4 26.3 34 28.9 29.6 29.7Z" fill="#7C9A73" />
      <path d="M29.5 29.7C30 25.5 28.3 23 25.3 21.6C24.9 25.4 26.4 28.1 29.5 29.7Z" fill="#AFC49C" />
      <path d="M29.4 30.2V34.2" stroke="#34483C" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function TodayBubbleIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...iconProps(size, props)}>
      <path d="M5.5 17.5C3.7 15.9 3 13.8 3 11.7C3 6.9 6.9 4 12 4s9 2.9 9 7.7-3.9 7.7-9 7.7c-1 0-2-.1-2.9-.4L5 20.2l.5-2.7Z" />
      <path d="M8.4 11.1h.1M12 11.1h.1M15.6 11.1h.1" />
    </svg>
  );
}

export function CalendarSoftIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...iconProps(size, props)}>
      <rect x="4" y="5.5" width="16" height="15" rx="3" />
      <path d="M8 3.8v3.4M16 3.8v3.4M4.5 10h15" />
      <path d="M8.2 14h.1M12 14h.1M15.8 14h.1M8.2 17.2h.1M12 17.2h.1" />
    </svg>
  );
}

export function UserSoftIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...iconProps(size, props)}>
      <circle cx="12" cy="8.5" r="3.4" />
      <path d="M5.2 20.2c.9-3.9 3.4-6 6.8-6s5.9 2.1 6.8 6" />
    </svg>
  );
}

export function BellSoftIcon({ size = 26, ...props }: IconProps) {
  return (
    <svg {...iconProps(size, props)}>
      <path d="M7.1 10.6c0-3 1.9-5.2 4.9-5.2s4.9 2.2 4.9 5.2v3.1l1.8 2.6H5.3l1.8-2.6v-3.1Z" />
      <path d="M10 18.4c.5 1 1.1 1.5 2 1.5s1.6-.5 2-1.5" />
      <circle cx="18.8" cy="6.1" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function DeepRoomIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...iconProps(size, props)}>
      <path d="M5.2 19V9.8C5.2 6.5 8 4 12 4s6.8 2.5 6.8 5.8V19" />
      <path d="M8 19v-8.7C8 8.6 9.6 7 12 7s4 1.6 4 3.3V19" />
      <path d="M10.2 13.3h.1M13.7 13.3h.1M10.2 16.2c1.1.9 2.5.9 3.6 0" />
    </svg>
  );
}

export function ClockSoftIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...iconProps(size, props)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.8v4.6l3 1.8" />
    </svg>
  );
}

export function ChatSoftIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...iconProps(size, props)}>
      <path d="M5 16.5C3.7 15.3 3.2 13.8 3.2 12c0-4.2 3.5-6.8 8.8-6.8s8.8 2.6 8.8 6.8-3.5 6.8-8.8 6.8c-.9 0-1.8-.1-2.6-.3L5.5 20l-.5-3.5Z" />
      <path d="M8.5 12h.1M12 12h.1M15.5 12h.1" />
    </svg>
  );
}

export function PlanCardIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...iconProps(size, props)}>
      <rect x="5" y="4" width="14" height="16" rx="3" />
      <path d="M9 9h6M9 13h4M9 16.5h5.5" />
      <path d="M7.5 4v3M16.5 4v3" />
    </svg>
  );
}

export function CheStatusIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...iconProps(size, props)}>
      <path d="M12 20.5c-4.2-2.8-7-5.8-7-9.3C5 8.5 6.7 7 8.8 7c1.4 0 2.6.7 3.2 1.8C12.6 7.7 13.8 7 15.2 7c2.1 0 3.8 1.5 3.8 4.2 0 3.5-2.8 6.5-7 9.3Z" />
      <path d="M12 11.2v3.2M10.4 12.8h3.2" />
    </svg>
  );
}

export function DumbbellSoftIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...iconProps(size, props)}>
      <path d="M4.5 9.2v5.6M7.4 8.2v7.6M16.6 8.2v7.6M19.5 9.2v5.6M7.4 12h9.2" />
    </svg>
  );
}

export function SproutIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...iconProps(size, props)}>
      <path d="M12 20V9.8" />
      <path d="M12 10.5C8.2 10 6.1 7.6 5.8 4.2C9.5 4.4 11.6 6.6 12 10.5Z" fill="currentColor" stroke="none" opacity="0.28" />
      <path d="M12.1 12.1c.7-3.8 3-5.8 6.5-5.9-.3 3.5-2.6 5.6-6.5 5.9Z" fill="currentColor" stroke="none" opacity="0.38" />
    </svg>
  );
}

export function ArrowRightSoftIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...iconProps(size, props)}>
      <path d="M5 12h13" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function BackSoftIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...iconProps(size, props)}>
      <path d="m14.5 6-6 6 6 6" />
    </svg>
  );
}

export function CloseSoftIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...iconProps(size, props)}>
      <path d="m7 7 10 10M17 7 7 17" />
    </svg>
  );
}

export function SendSoftIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...iconProps(size, props)} style={{ transform: 'translateX(-1px)', ...props.style }}>
      <path d="m4.5 11 14-6.2c.7-.3 1.4.4 1 1.1l-6.2 13.6c-.3.7-1.3.6-1.5-.1l-1.4-4.7-4.8-1.6c-.7-.2-.8-1.2-.1-1.5Z" />
      <path d="m10.5 14.5 3.7-3.7" />
    </svg>
  );
}
