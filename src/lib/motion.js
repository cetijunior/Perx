// Shared motion constants — every component imports these so curves stay identical.
export const EASE = [0.22, 1, 0.36, 1] // expo-out
export const SPRING = { type: 'spring', stiffness: 260, damping: 20 }
export const SPRING_SOFT = { type: 'spring', stiffness: 180, damping: 22 }

export const DUR = { micro: 0.16, base: 0.28, page: 0.34 }

export const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE } },
}

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DUR.base, ease: EASE } },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: DUR.base, ease: EASE } },
}

export const stagger = (s = 0.05, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: s, delayChildren: delay } },
})

export const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: DUR.page, ease: EASE } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.2, ease: EASE } },
}

export const tap = { scale: 0.97 }
export const hoverLift = { y: -2, transition: { duration: DUR.micro, ease: EASE } }
