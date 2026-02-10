import { motion as fm, useReducedMotion } from 'framer-motion';
import { motion as tokens } from '@/theme/motion';

type PulseIconProps = {
  src: string;
  size?: number;
  trigger: number; // increment to trigger pulse
};

export function PulseIcon({ src, size = 24, trigger }: PulseIconProps) {
  const reduceMotion = useReducedMotion();

  return (
    <fm.img
      key={trigger} // retriggers animation
      src={src}
      width={size}
      height={size}
      alt=""
      style={{ display: 'block' }}
      animate={
        reduceMotion
          ? { opacity: [1, 0.92, 1] }
          : {
              scaleY: [1, tokens.pulse.scaleY, 1],
              opacity: [1, tokens.pulse.opacityDip, 1],
            }
      }
      transition={{
        duration: reduceMotion ? 0.12 : tokens.pulse.duration,
        ease: tokens.pulse.easing,
      }}
    />
  );
}
