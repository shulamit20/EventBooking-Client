import { motion } from 'framer-motion'

/** Wrap a page so it fades/slides in and out on route change. */
export function PageTransition({ children }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.main>
  )
}

/** A grid/list whose children pop in one after another. */
export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

export const popIn = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
}

export const MotionDiv = motion.div
