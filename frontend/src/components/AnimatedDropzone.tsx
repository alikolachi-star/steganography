import { motion } from "motion/react"
import { useCallback } from "react"
import { useDropzone, type DropEvent, type FileRejection } from "react-dropzone"
import { ImageIcon, Upload } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"

interface AnimatedDropzoneProps {
  onFileSelect: (file: File) => void
  preview?: string | null
  accept?: Record<string, string[]>
  label?: string
  hint?: string
}

const ACCEPTED_EXTENSIONS = new Set(["png", "bmp"])

function isAcceptedImage(file: File): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase()
  if (ext && ACCEPTED_EXTENSIONS.has(ext)) return true

  const type = file.type.toLowerCase()
  return (
    type === "image/png" ||
    type === "image/bmp" ||
    type === "image/x-ms-bmp" ||
    type === "image/x-png"
  )
}

/** Sync capture — react-dropzone's default async fromEvent can lose dataTransfer in React 19. */
function getFilesFromEvent(event: DropEvent): Promise<File[]> {
  if ("dataTransfer" in event && event.dataTransfer?.files?.length) {
    return Promise.resolve(Array.from(event.dataTransfer.files))
  }
  if (
    "target" in event &&
    event.target instanceof HTMLInputElement &&
    event.target.files?.length
  ) {
    return Promise.resolve(Array.from(event.target.files))
  }
  return Promise.resolve([])
}

export function AnimatedDropzone({
  onFileSelect,
  preview,
  accept = {
    "image/png": [".png"],
    "image/bmp": [".bmp"],
    "image/x-ms-bmp": [".bmp"],
  },
  label = "Drop your image here",
  hint = "PNG or BMP only — JPEG destroys hidden data",
}: AnimatedDropzoneProps) {
  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      if (accepted[0]) {
        onFileSelect(accepted[0])
        return
      }

      // Fallback: extension check when MIME type is missing on drag-drop
      const byExtension = rejected.find((r) => isAcceptedImage(r.file))
      if (byExtension) {
        onFileSelect(byExtension.file)
        return
      }

      if (rejected[0]) {
        toast.error("Only PNG and BMP images are supported")
      }
    },
    [onFileSelect]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    multiple: false,
    getFilesFromEvent,
    validator: (file) => {
      if (isAcceptedImage(file)) return null
      return {
        code: "invalid-file-type",
        message: "Only PNG and BMP images are supported",
      }
    },
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300",
        isDragActive
          ? "border-emerald-400 bg-emerald-500/10 scale-[1.01]"
          : "border-border hover:border-emerald-500/40 hover:bg-secondary/30"
      )}
    >
      <input {...getInputProps()} />

      {preview ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative aspect-video w-full"
        >
          <img
            src={preview}
            alt="Preview"
            className="h-full w-full object-contain p-4 pointer-events-none"
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <p className="flex items-center gap-2 text-sm font-medium text-white">
              <Upload className="h-4 w-4" />
              Click or drop to replace
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="pointer-events-none flex flex-col items-center justify-center gap-4 px-6 py-16">
          <motion.div
            animate={isDragActive ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10"
          >
            <ImageIcon className="h-8 w-8 text-emerald-400" />
          </motion.div>
          <div className="text-center">
            <p className="font-medium text-foreground">{label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
          </div>
        </div>
      )}

      {isDragActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-emerald-400 ring-offset-2 ring-offset-background"
        />
      )}
    </div>
  )
}
