import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File
    const fieldType = formData.get("fieldType") as string

    console.log("[v0] Transcription request:", {
      hasAudio: !!audioFile,
      audioType: audioFile?.type,
      audioSize: audioFile?.size,
      fieldType,
    })

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    const transcriptionFormData = new FormData()
    // Create a new file with .webm extension to help OpenAI identify the format
    const audioFileWithExt = new File([audioFile], "audio.webm", { type: "audio/webm" })
    transcriptionFormData.append("file", audioFileWithExt)
    transcriptionFormData.append("model", process.env.AI_TRANSCRIBE_MODEL || "whisper-1")

    console.log("[v0] Sending to OpenAI with API key present:", !!process.env.OPENAI_API_KEY)

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: transcriptionFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Transcription API error:", { status: response.status, errorText })
      return NextResponse.json(
        {
          error: "Failed to transcribe audio",
          details: errorText,
        },
        { status: response.status },
      )
    }

    const result = await response.json()
    console.log("[v0] Transcription result:", result)

    let transcription = result.text || ""

    // Truncate based on field type
    if (fieldType === "title") {
      transcription = transcription.substring(0, 100)
    } else if (fieldType === "description") {
      transcription = transcription.substring(0, 3000)
    }

    return NextResponse.json({ transcription })
  } catch (error) {
    console.error("[v0] Transcription error:", error)
    return NextResponse.json(
      {
        error: "Failed to process transcription",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
