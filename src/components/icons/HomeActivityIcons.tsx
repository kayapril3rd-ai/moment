import { useId } from 'react';
import type { SVGProps } from 'react';
import type { AgentSceneDefinition, SceneType } from '../../types/che';

const todayImageUrl = new URL('../../assets/home-activity-icons/approved/today.png', import.meta.url).href;
const companionBubbleImageUrl = new URL('../../assets/home-activity-icons/approved/companion-bubble.png', import.meta.url).href;
const quietChatImageUrl = new URL('../../assets/home-activity-icons/approved/quiet-chat.png', import.meta.url).href;
const catHeadImageUrl = new URL('../../assets/home-activity-icons/approved/cat-head.png', import.meta.url).href;
const dogHeadImageUrl = new URL('../../assets/home-activity-icons/approved/dog-head.png', import.meta.url).href;
const planImageUrl = new URL('../../assets/home-activity-icons/approved/plan.png', import.meta.url).href;
const walkImageUrl = new URL('../../assets/home-activity-icons/approved/walk.png', import.meta.url).href;
const mealImageUrl = new URL('../../assets/home-activity-icons/approved/meal.png', import.meta.url).href;
const restImageUrl = new URL('../../assets/home-activity-icons/approved/rest.png', import.meta.url).href;
const fitnessImageUrl = new URL('../../assets/home-activity-icons/approved/fitness.png', import.meta.url).href;
const movieImageUrl = new URL('../../assets/home-activity-icons/approved/movie.png', import.meta.url).href;
const studyImageUrl = new URL('../../assets/home-activity-icons/approved/study.png', import.meta.url).href;

export interface HomeActivityIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

interface ActivityIconProps extends HomeActivityIconProps {
  sceneType: SceneType;
  worldScene?: AgentSceneDefinition;
}

function IconBase({ size = 24, children, ...props }: HomeActivityIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" {...props}>
      {children}
    </svg>
  );
}

function ApprovedGlyphIcon({ imageUrl, ...props }: HomeActivityIconProps & { imageUrl: string }) {
  const maskId = `approved-glyph-${useId().replace(/:/g, '')}`;
  return (
    <IconBase {...props} stroke="none">
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" style={{ maskType: 'alpha' }}>
          <image href={imageUrl} x="0" y="0" width="24" height="24" />
        </mask>
      </defs>
      <rect width="24" height="24" fill="currentColor" mask={`url(#${maskId})`} />
    </IconBase>
  );
}

export function TodaySproutIcon(props: HomeActivityIconProps) {
  return <ApprovedGlyphIcon {...props} imageUrl={todayImageUrl} />;
}

export function CompanionBubbleIcon(props: HomeActivityIconProps) {
  return <ApprovedGlyphIcon {...props} imageUrl={companionBubbleImageUrl} />;
}

export function CatHeadIcon(props: HomeActivityIconProps) {
  return <ApprovedGlyphIcon {...props} imageUrl={catHeadImageUrl} />;
}

export function DogHeadIcon(props: HomeActivityIconProps) {
  return <ApprovedGlyphIcon {...props} imageUrl={dogHeadImageUrl} />;
}

export function QuietChatCatBubbleIcon(props: HomeActivityIconProps) {
  return <ApprovedGlyphIcon {...props} imageUrl={quietChatImageUrl} />;
}

export function PlanClipboardIcon(props: HomeActivityIconProps) {
  return <ApprovedGlyphIcon {...props} imageUrl={planImageUrl} />;
}

export function WalkPawIcon(props: HomeActivityIconProps) {
  return <ApprovedGlyphIcon {...props} imageUrl={walkImageUrl} />;
}

export function MealIcon(props: HomeActivityIconProps) {
  return <ApprovedGlyphIcon {...props} imageUrl={mealImageUrl} />;
}

export function SleepIcon(props: HomeActivityIconProps) {
  return <ApprovedGlyphIcon {...props} imageUrl={restImageUrl} />;
}

export function FitnessActivityIcon(props: HomeActivityIconProps) {
  return <ApprovedGlyphIcon {...props} imageUrl={fitnessImageUrl} />;
}

export function MovieActivityIcon(props: HomeActivityIconProps) {
  return <ApprovedGlyphIcon {...props} imageUrl={movieImageUrl} />;
}

export function StudyActivityIcon(props: HomeActivityIconProps) {
  return <ApprovedGlyphIcon {...props} imageUrl={studyImageUrl} />;
}

export function GamingActivityIcon(props: HomeActivityIconProps) {
  return <IconBase {...props}><path d="M7.7 8.2h8.6c2.4 0 4.3 1.8 4.3 4.2l-.5 4c-.2 1.7-2.3 2.3-3.3 1L15 15.1H9l-1.8 2.3c-1 1.3-3.1.7-3.3-1l-.5-4c0-2.4 1.9-4.2 4.3-4.2Z" /><path d="M8.1 10.8v3.1M6.6 12.4h3M15.9 11.4h.01M18 13.2h.01" /></IconBase>;
}

export function ActivityIcon({ sceneType, worldScene, ...props }: ActivityIconProps) {
  const isOutdoor = worldScene?.sceneKey === 'hangout' || worldScene?.sceneKey === 'commute' || worldScene?.sceneKey === 'errand' || worldScene?.sceneVariant === 'park' || worldScene?.sceneVariant === 'seaside' || worldScene?.sceneVariant === 'grocery';
  if (isOutdoor || sceneType === 'commute') return <WalkPawIcon {...props} />;
  if (sceneType === 'study') return <StudyActivityIcon {...props} />;
  if (sceneType === 'watch') return <MovieActivityIcon {...props} />;
  if (sceneType === 'fitness') return <FitnessActivityIcon {...props} />;
  if (sceneType === 'meal') return <MealIcon {...props} />;
  if (sceneType === 'sleep') return <SleepIcon {...props} />;
  if (sceneType === 'gaming') return <GamingActivityIcon {...props} />;
  if (sceneType === 'deep_room') return <CatHeadIcon {...props} />;
  return <SleepIcon {...props} />;
}
