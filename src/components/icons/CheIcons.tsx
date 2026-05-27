import type { SVGProps } from 'react';

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

interface LogoProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

function IconBase({ size = 24, children, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {children}
    </svg>
  );
}

function RoundIconBase({ size = 24, children, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="24" cy="24" r="22" fill="currentColor" opacity="0.13" />
      {children}
    </svg>
  );
}

export function CheLogoMark({ size = 40, className, ...props }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <rect width="1024" height="1024" rx="228" fill="#F6F5F2" />
      <rect x="132" y="132" width="760" height="760" rx="190" fill="#FBF9F4" />
      <path d="M217 363C217 268 285 206 380 206h266c101 0 161 61 161 162v232c0 98-64 162-161 162H420L300 862c-28 24-83 7-83-34V363Z" stroke="#26353A" strokeWidth="48" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M395 397v85M612 397v85" stroke="#26353A" strokeWidth="54" strokeLinecap="round" />
      <path d="M401 595c58 58 153 62 215 6" stroke="#26353A" strokeWidth="44" strokeLinecap="round" />
      <path d="M312 663c-70 33-136-15-136-87 0-63 53-118 121-124 83-8 145 62 116 136-16 39-52 62-101 75Z" fill="#26353A" />
      <path d="M682 674c6-84 52-139 122-162M694 672c62-23 121-9 154 39M736 577c5-47 31-84 75-107" stroke="#2F5F47" strokeWidth="36" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CheLogoSmall(props: LogoProps) {
  return <CheLogoMark {...props} />;
}

export function TodayIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 8.7C5 6.1 7.1 4 9.7 4h4.6C16.9 4 19 6.1 19 8.7v2.4c0 2.6-2.1 4.7-4.7 4.7H10l-3.1 2.7c-.8.7-1.9.1-1.9-.9V8.7Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 10.2h.01M15 10.2h.01M9.7 13c1.4 1.2 3.1 1.2 4.6 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </IconBase>
  );
}

export function ArrangeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6.5 5.5h11A2.5 2.5 0 0 1 20 8v9.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5V8a2.5 2.5 0 0 1 2.5-2.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8 4v3M16 4v3M4.5 9h15M8 13h3M8 16h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </IconBase>
  );
}

export function MineIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 12.2a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5.2 20c.9-3.5 3.4-5.3 6.8-5.3s5.9 1.8 6.8 5.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </IconBase>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7.2 10.2c0-3.1 1.9-5.3 4.8-5.3s4.8 2.2 4.8 5.3v2.6l1.5 2.6H5.7l1.5-2.6v-2.6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M10.3 18.2c.4.9 1 1.4 1.7 1.4s1.3-.5 1.7-1.4M12 3v1.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </IconBase>
  );
}

export function BackIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M14.5 6.5 9 12l5.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

export function SendIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 12.4 18.5 5.8c.6-.3 1.2.3.9.9l-5.8 12.8c-.3.6-1.1.5-1.3-.1l-1.4-4.2-4.5-1.5c-.6-.2-.7-1-.1-1.3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m11 15 3.2-3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </IconBase>
  );
}

export function ChatIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5.5 8.6c0-2.5 2-4.5 4.5-4.5h4c2.5 0 4.5 2 4.5 4.5v2.1c0 2.5-2 4.5-4.5 4.5h-3.4l-2.7 2.5c-.8.7-1.9.2-1.9-.9V8.6Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v4.2l2.8 1.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </IconBase>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m5.5 12.3 4 4 9-9.6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

export function StatusDotIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="4" fill="currentColor" />
    </IconBase>
  );
}

export function StudyIcon(props: IconProps) {
  return (
    <RoundIconBase {...props}>
      <path d="M16 15.5h10.5c3 0 5.5 2.4 5.5 5.5v11.5H18c-2.2 0-4-1.8-4-4v-11c0-1.1.9-2 2-2ZM32 15.5v17H20" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </RoundIconBase>
  );
}

export function ParkIcon(props: IconProps) {
  return (
    <RoundIconBase {...props}>
      <path d="M24 34V18M17 25c-4-1-5.5-4.5-4-7 4.8-.4 8 2.3 8 7M31 22c4.5-.8 6.8-4.2 5.5-7-5.3-.8-9 1.6-9.6 6.2M16 35h17" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </RoundIconBase>
  );
}

export function MovieIcon(props: IconProps) {
  return (
    <RoundIconBase {...props}>
      <path d="M14 18h20v13H14V18ZM18 18l3-5M25 18l3-5M32 18l3-5M18 35h12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </RoundIconBase>
  );
}

export function FitnessIcon(props: IconProps) {
  return (
    <RoundIconBase {...props}>
      <path d="M14 26h20M18 20v12M30 20v12M12 22v8M36 22v8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </RoundIconBase>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <RoundIconBase {...props}>
      <path d="M24 30a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM24 9v4M24 35v4M9 24h4M35 24h4M13.5 13.5l2.8 2.8M31.7 31.7l2.8 2.8M34.5 13.5l-2.8 2.8M16.3 31.7l-2.8 2.8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </RoundIconBase>
  );
}

export function CoffeeIcon(props: IconProps) {
  return (
    <RoundIconBase {...props}>
      <path d="M15 19h16v8a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6v-8ZM31 21h2.5a3.5 3.5 0 0 1 0 7H31M18 14c0-2 2-2 2-4M25 14c0-2 2-2 2-4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </RoundIconBase>
  );
}

export function WalkIcon(props: IconProps) {
  return (
    <RoundIconBase {...props}>
      <path d="M24.5 17.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM22 20l-3 6 5 3 1 7M25 22l4 4 5 1M20 30l-4 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </RoundIconBase>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <RoundIconBase {...props}>
      <path d="M32 32.5A12 12 0 0 1 20.4 13a11 11 0 1 0 15 15 12 12 0 0 1-3.4 4.5Z" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </RoundIconBase>
  );
}

export function LeafIcon(props: IconProps) {
  return (
    <RoundIconBase {...props}>
      <path d="M24 35V20M16 25c-3.8-1.2-5.2-4.4-4-7 4.6-.2 7.8 2.5 8 7M28 22c5-.9 7.5-4.5 6.2-7.5-5.8-.7-9.5 2.2-10 7.3" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </RoundIconBase>
  );
}

export function DeepRoomIcon(props: IconProps) {
  return (
    <RoundIconBase {...props}>
      <path d="M15 34V19c0-4.4 3.6-8 8-8h2c4.4 0 8 3.6 8 8v15M20 34V20c0-1.7 1.3-3 3-3h2c1.7 0 3 1.3 3 3v14M23 26h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </RoundIconBase>
  );
}
