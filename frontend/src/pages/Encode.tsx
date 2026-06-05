import { motion, AnimatePresence } from "motion/react"
import { Check, Download, Loader2, Upload } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { api, ApiError } from "@/api/client"
import { AnimatedDropzone } from "@/components/AnimatedDropzone"
import { CapacityBar, estimateCapacity } from "@/components/CapacityBar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function Encode() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [maxBytes, setMaxBytes] = useState(0)
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [downloadName, setDownloadName] = useState("stego.png")
  const [success, setSuccess] = useState(false)

  const handleFileSelect = useCallback((selected: File) => {
    setFile(selected)
    setSuccess(false)
    setDownloadUrl(null)

    const url = URL.createObjectURL(selected)
    setPreview(url)

    const img = new Image()
    img.onload = () => {
      setMaxBytes(estimateCapacity(img.width, img.height))
    }
    img.src = url
  }, [])

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
      if (downloadUrl) URL.revokeObjectURL(downloadUrl)
    }
  }, [preview, downloadUrl])

  const messageBytes = new TextEncoder().encode(message).length

  const handleEncode = async () => {
    if (!file || !message.trim()) {
      toast.error("Please select an image and enter a message")
      return
    }
    if (messageBytes > maxBytes) {
      toast.error("Message exceeds image capacity")
      return
    }

    setLoading(true)
    try {
      const { blob, filename } = await api.encode(file, message)
      if (downloadUrl) URL.revokeObjectURL(downloadUrl)
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
      setDownloadName(filename)
      setSuccess(true)
      toast.success("Message hidden successfully!")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Encode failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold">
          <span className="gradient-text">Encode</span> a message
        </h1>
        <p className="mt-2 text-muted-foreground">
          Hide secret text inside a PNG or BMP image using LSB steganography
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-emerald-400" />
              Cover Image
            </CardTitle>
            <CardDescription>
              Select a lossless image to use as the cover
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatedDropzone
              onFileSelect={handleFileSelect}
              preview={preview}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Secret Message</CardTitle>
            <CardDescription>
              This text will be embedded invisibly in the image
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                setSuccess(false)
              }}
              placeholder="Enter your secret message here..."
              rows={8}
              className="flex w-full resize-none rounded-lg border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
            />
            {maxBytes > 0 && (
              <CapacityBar messageLength={messageBytes} maxBytes={maxBytes} />
            )}
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <Button
                className="w-full"
                size="lg"
                onClick={handleEncode}
                disabled={loading || !file || !message.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Encoding...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Hide message
                  </>
                )}
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </div>

      <AnimatePresence>
        {success && downloadUrl && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="mt-6"
          >
            <Card className="border-emerald-500/20">
              <CardContent className="flex items-center justify-between pt-6">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15"
                  >
                    <Check className="h-5 w-5 text-emerald-400" />
                  </motion.div>
                  <div>
                    <p className="font-medium text-emerald-300">Encoding complete</p>
                    <p className="text-sm text-muted-foreground">
                      Your stego image is ready to download
                    </p>
                  </div>
                </div>
                <Button asChild size="lg">
                  <a href={downloadUrl} download={downloadName}>
                    <Download className="h-4 w-4" />
                    Download PNG
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
