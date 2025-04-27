// src/utils/animation.ts
export const getReducedMotionVariants = (regularVariants: any, reducedVariants: any = null) => {
  if (typeof window === 'undefined') return regularVariants;
  
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    return reducedVariants || {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    };
  }
  
  return regularVariants;
};