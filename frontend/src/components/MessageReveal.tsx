import { motion } from "motion/react"
import { Check, Copy } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface MessageRevealProps {
  message: string
}

export function MessageReveal({ message }: MessageRevealProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message)
    setCopied(true)
    toast.success("Copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="border-emerald-500/20">
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15"
              >
                <Check className="h-4 w-4 text-emerald-400" />
              </motion.div>
              <p className="font-medium text-emerald-300">Message extracted</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="whitespace-pre-wrap break-words rounded-lg bg-secondary/50 p-4 font-mono text-sm leading-relaxed"
          >
            {message.split("").map((char, i) => (
              <motion.span
                key={`${char}-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.01, duration: 0.1 }}
              >
                {char}
              </motion.span>
            ))}
          </motion.p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
