import { motion } from "motion/react"
import { Eye, Loader2 } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { api, ApiError } from "@/api/client"
import { AnimatedDropzone } from "@/components/AnimatedDropzone"
import { MessageReveal } from "@/components/MessageReveal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function Decode() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFileSelect = useCallback((selected: File) => {
    setFile(selected)
    setMessage(null)
    setPreview(URL.createObjectURL(selected))
  }, [])

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const handleDecode = async () => {
    if (!file) {
      toast.error("Please select a stego image")
      return
    }

    setLoading(true)
    setMessage(null)
    try {
      const result = await api.decode(file)
      setMessage(result.message)
      toast.success("Message extracted!")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Decode failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold">
          <span className="gradient-text">Decode</span> a message
        </h1>
        <p className="mt-2 text-muted-foreground">
          Upload a stego image to extract the hidden text
        </p>
      </motion.div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-cyan-400" />
            Stego Image
          </CardTitle>
          <CardDescription>
            Upload the image that contains a hidden message
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AnimatedDropzone
            onFileSelect={handleFileSelect}
            preview={preview}
            label="Drop your stego image here"
          />
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <Button
              className="w-full"
              size="lg"
              onClick={handleDecode}
              disabled={loading || !file}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Extract message
                </>
              )}
            </Button>
          </motion.div>
        </CardContent>
      </Card>

      {message && <MessageReveal message={message} />}
    </div>
  )
}
