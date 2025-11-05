"use client"

import { useRouter } from "next/navigation"
import { ArtifactAiPanel } from "./ArtifactAiPanel"

interface ArtifactAiPanelWrapperProps {
  artifactId: string
  analysis_status?: string
  analysis_error?: string | null
  transcript?: string | null
  ai_description?: string | null
  image_captions?: Record<string, string> | null
}

export function ArtifactAiPanelWrapper(props: ArtifactAiPanelWrapperProps) {
  const router = useRouter()

  const handleRefresh = async () => {
    router.refresh()
  }

  return <ArtifactAiPanel {...props} onRefresh={handleRefresh} />
}
