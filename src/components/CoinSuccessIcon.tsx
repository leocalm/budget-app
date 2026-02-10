// src/components/CoinSuccessIcon.tsx
import { AnimatePresence, motion as fm, useReducedMotion } from 'framer-motion';
import { motion as tokens } from '@/theme/motion';

type Props = {
  baseSrc: string;
  coinSrc: string;
  size?: number;
  showCoin: boolean;
};

export function CoinSuccessIcon({ baseSrc, coinSrc, size = 64, showCoin }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* Base icon */}
      <img
        src={baseSrc}
        width={size}
        height={size}
        alt=""
        style={{ position: 'absolute', inset: 0 }}
      />

      {/* Coin variant */}
      <AnimatePresence>
        {showCoin && (
          <fm.img
            src={coinSrc}
            width={size}
            height={size}
            alt=""
            style={{ position: 'absolute', inset: 0 }}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: reduceMotion ? 0.12 : tokens.coin.drop,
              ease: 'easeInOut',
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
