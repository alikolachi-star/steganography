import { motion } from "motion/react"
import { Clock, FileImage, History, Inbox } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { api, type Operation } from "@/api/client"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
}

export function HistoryPage() {
  const [operations, setOperations] = useState<Operation[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .history()
      .then((data) => {
        setOperations(data.items)
        setTotal(data.total)
      })
      .catch(() => toast.error("Failed to load history"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold">
          Operation <span className="gradient-text">History</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          {total} operation{total !== 1 ? "s" : ""} recorded
        </p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
      ) : operations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl glass"
          >
            <Inbox className="h-10 w-10 text-muted-foreground" />
          </motion.div>
          <p className="text-lg font-medium text-muted-foreground">No operations yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Encode or decode a message to see it here
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {operations.map((op) => (
            <motion.div key={op.id} variants={itemVariants}>
              <Card className="transition-colors hover:border-emerald-500/20">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    {op.type === "encode" ? (
                      <History className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <FileImage className="h-4 w-4 text-cyan-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={op.type === "encode" ? "encode" : "decode"}>
                        {op.type}
                      </Badge>
                      <span className="truncate text-sm font-medium">
                        {op.original_filename}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(op.created_at)}
                      </span>
                      {op.message_length != null && (
                        <span>{op.message_length} bytes</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
