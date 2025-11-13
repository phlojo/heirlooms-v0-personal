"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { generateCloudinaryTranscriptionSignature } from "@/lib/actions/cloudinary"

interface TranscriptionInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: "input" | "textarea"
  fieldType: "title" | "description"
  userId: string
  disabled?: boolean
  rows?: number
}

export function TranscriptionInput({
  value,
  onChange,
  placeholder,
  type = "input",
  fieldType,
  userId,
  disabled = false,
  rows = 4,
}: TranscriptionInputProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const options = { mimeType: "audio/webm;codecs=opus" }
      let mediaRecorder: MediaRecorder

      try {
        mediaRecorder = new MediaRecorder(stream, options)
      } catch (e) {
        // Fallback to default if opus codec not supported
        console.log("[v0] Opus codec not supported, using default")
        mediaRecorder = new MediaRecorder(stream)
      }

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        console.log("[v0] Recording stopped, blob size:", audioBlob.size)
        await handleTranscription(audioBlob)

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      console.log("[v0] Recording started")
    } catch (error) {
      console.error("[v0] Error starting recording:", error)
      alert("Failed to access microphone. Please check your browser permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      console.log("[v0] Stopping recording...")
    }
  }

  const handleTranscription = async (audioBlob: Blob) => {
    setIsTranscribing(true)

    try {
      console.log("[v0] Starting transcription process")

      // First, transcribe the audio
      const transcriptionFormData = new FormData()
      transcriptionFormData.append("audio", audioBlob, "audio.webm")
      transcriptionFormData.append("fieldType", fieldType)

      console.log("[v0] Sending audio to transcription API")

      const transcriptionResponse = await fetch("/api/transcribe", {
        method: "POST",
        body: transcriptionFormData,
      })

      if (!transcriptionResponse.ok) {
        const errorData = await transcriptionResponse.json()
        console.error("[v0] Transcription API error:", errorData)
        throw new Error(errorData.details || errorData.error || "Failed to transcribe audio")
      }

      const { transcription } = await transcriptionResponse.json()
      console.log("[v0] Transcription successful:", transcription)
      onChange(transcription)

      // Then, upload to Cloudinary for storage
      const fileName = `${fieldType}-${Date.now()}.webm`
      const signatureResult = await generateCloudinaryTranscriptionSignature(userId, fileName, fieldType)

      if (signatureResult.error || !signatureResult.signature) {
        console.error("[v0] Cloudinary signature error:", signatureResult.error)
        // Don't throw - transcription worked, just log the storage failure
        console.warn("[v0] Failed to upload audio to Cloudinary, but transcription succeeded")
        return
      }

      const cloudinaryFormData = new FormData()
      cloudinaryFormData.append("file", audioBlob, fileName)
      cloudinaryFormData.append("public_id", signatureResult.publicId!)
      cloudinaryFormData.append("timestamp", signatureResult.timestamp!.toString())
      cloudinaryFormData.append("api_key", signatureResult.apiKey!)
      cloudinaryFormData.append("signature", signatureResult.signature)

      const uploadUrl = `https://api.cloudinary.com/v1_1/${signatureResult.cloudName}/video/upload`

      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        body: cloudinaryFormData,
      })

      if (!uploadResponse.ok) {
        console.warn("[v0] Failed to upload audio to Cloudinary, but transcription succeeded")
      } else {
        const uploadData = await uploadResponse.json()
        console.log("[v0] Transcription audio uploaded to Cloudinary:", uploadData.secure_url)
      }
    } catch (error) {
      console.error("[v0] Transcription error:", error)
      alert(
        `Failed to transcribe audio: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
      )
    } finally {
      setIsTranscribing(false)
    }
  }

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const InputComponent = type === "textarea" ? Textarea : Input

  return (
    <div className="relative">
      <InputComponent
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled || isRecording || isTranscribing}
        rows={type === "textarea" ? rows : undefined}
        className="pr-10"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleMicClick}
        disabled={disabled || isTranscribing}
        className="absolute right-1 top-1 h-8 w-8"
        title={isRecording ? "Stop recording" : "Start recording"}
      >
        {isTranscribing ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <Mic className={`h-4 w-4 ${isRecording ? "text-destructive animate-pulse" : "text-muted-foreground"}`} />
        )}
      </Button>
    </div>
  )
}
