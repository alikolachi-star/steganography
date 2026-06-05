import { AnimatePresence, motion } from "motion/react"
import { useLocation, useOutlet } from "react-router-dom"

export function PageTransition() {
  const location = useLocation()
  const outlet = useOutlet()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex-1"
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  )
}
