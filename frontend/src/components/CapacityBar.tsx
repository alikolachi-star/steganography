import { motion } from "motion/react"

import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface CapacityBarProps {
  messageLength: number
  maxBytes: number
}

export function CapacityBar({ messageLength, maxBytes }: CapacityBarProps) {
  const percent = maxBytes > 0 ? Math.min((messageLength / maxBytes) * 100, 100) : 0
  const remaining = Math.max(maxBytes - messageLength, 0)

  const colorClass =
    percent > 90 ? "text-red-400" : percent > 70 ? "text-amber-400" : "text-emerald-400"

  const progressColor =
    percent > 90
      ? "[&>div]:bg-red-500"
      : percent > 70
        ? "[&>div]:bg-amber-500"
        : "[&>div]:bg-emerald-500"

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Capacity used</span>
        <span className={cn("font-medium tabular-nums", colorClass)}>
          {messageLength.toLocaleString()} / {maxBytes.toLocaleString()} bytes
        </span>
      </div>
      <Progress value={percent} className={cn("h-2", progressColor)} />
      <p className="text-xs text-muted-foreground">
        {remaining.toLocaleString()} bytes remaining
      </p>
    </motion.div>
  )
}

export function estimateCapacity(width: number, height: number): number {
  const totalBits = width * height * 3
  const headerBits = 32
  return Math.floor((totalBits - headerBits) / 8)
}
