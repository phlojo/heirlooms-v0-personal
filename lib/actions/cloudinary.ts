"use server"

export async function generateCloudinarySignature(userId: string, fileName: string) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    return {
      error:
        "Cloudinary credentials not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your environment variables.",
    }
  }

  try {
    const timestamp = Math.round(Date.now() / 1000)

    const safeUser = (userId || "anon").replace(/[^a-zA-Z0-9_-]/g, "")
    const baseName = (fileName || "file")
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .substring(0, 50)

    const now = new Date()
    const yyyy = now.getUTCFullYear()
    const mm = String(now.getUTCMonth() + 1).padStart(2, "0")
    const publicId = `users/${safeUser}/artifacts/${yyyy}/${mm}/${baseName}`

    const eager = "c_fill,w_640,h_640,q_auto,f_auto|c_limit,w_1200,h_1200,q_auto,f_auto"

    const crypto = await import("node:crypto")
    const toSign = `eager=${eager}&public_id=${publicId}&timestamp=${timestamp}`
    const signature = crypto
      .createHash("sha1")
      .update(toSign + apiSecret)
      .digest("hex")

    return {
      cloudName,
      apiKey,
      signature,
      timestamp,
      publicId,
      eager,
      folder: undefined,
    }
  } catch (error) {
    console.error("Error generating Cloudinary signature:", error)
    return { error: "Failed to generate upload signature. Please try again." }
  }
}

export async function generateCloudinaryAudioSignature(userId: string, fileName: string) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    return {
      error:
        "Cloudinary credentials not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your environment variables.",
    }
  }

  try {
    const timestamp = Math.round(Date.now() / 1000)

    const safeUser = (userId || "anon").replace(/[^a-zA-Z0-9_-]/g, "")
    const baseName = (fileName || "file")
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .substring(0, 50)

    const now = new Date()
    const yyyy = now.getUTCFullYear()
    const mm = String(now.getUTCMonth() + 1).padStart(2, "0")
    const publicId = `users/${safeUser}/artifacts/audio/${yyyy}/${mm}/${baseName}`

    const crypto = await import("node:crypto")
    const toSign = `public_id=${publicId}&timestamp=${timestamp}`
    const signature = crypto
      .createHash("sha1")
      .update(toSign + apiSecret)
      .digest("hex")

    return {
      signature,
      timestamp,
      publicId,
      cloudName,
      apiKey,
    }
  } catch (error) {
    console.error("Error generating Cloudinary audio signature:", error)
    return { error: "Failed to generate upload signature. Please try again." }
  }
}

export async function deleteCloudinaryMedia(publicId: string) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    console.error("Cloudinary credentials not configured")
    return { error: "Cloudinary credentials not configured" }
  }

  try {
    const timestamp = Math.round(Date.now() / 1000)

    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`
    const encoder = new TextEncoder()
    const data = encoder.encode(stringToSign)
    const hashBuffer = await crypto.subtle.digest("SHA-1", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const signature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

    const formData = new FormData()
    formData.append("public_id", publicId)
    formData.append("signature", signature)
    formData.append("api_key", apiKey)
    formData.append("timestamp", timestamp.toString())

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: "POST",
      body: formData,
    })

    const result = await response.json()

    if (result.result === "ok") {
      return { success: true }
    } else {
      console.error("Cloudinary deletion failed:", result)
      return { error: "Failed to delete media from Cloudinary" }
    }
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error)
    return { error: "Failed to delete media from Cloudinary" }
  }
}

export async function extractPublicIdFromUrl(url: string): Promise<string | null> {
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/)
    return match ? match[1] : null
  } catch (error) {
    console.error("Error extracting public ID:", error)
    return null
  }
}

export async function generateCloudinaryTranscriptionSignature(
  userId: string,
  fileName: string,
  fieldType: "title" | "description",
  entityType: "artifact" | "collection" = "artifact",
) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    return {
      error:
        "Cloudinary credentials not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your environment variables.",
    }
  }

  try {
    const timestamp = Math.round(Date.now() / 1000)

    const safeUser = (userId || "anon").replace(/[^a-zA-Z0-9_-]/g, "")
    const baseName = (fileName || "file")
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .substring(0, 50)

    const now = new Date()
    const yyyy = now.getUTCFullYear()
    const mm = String(now.getUTCMonth() + 1).padStart(2, "0")
    const publicId = `users/${safeUser}/transcriptions/${entityType}/${fieldType}/${yyyy}/${mm}/${baseName}`

    const crypto = await import("node:crypto")
    const toSign = `public_id=${publicId}&timestamp=${timestamp}`
    const signature = crypto
      .createHash("sha1")
      .update(toSign + apiSecret)
      .digest("hex")

    return {
      signature,
      timestamp,
      publicId,
      cloudName,
      apiKey,
    }
  } catch (error) {
    console.error("Error generating Cloudinary transcription signature:", error)
    return { error: "Failed to generate upload signature. Please try again." }
  }
}
