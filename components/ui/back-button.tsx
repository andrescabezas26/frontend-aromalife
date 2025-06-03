"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"

export function BackButton() {
  const router = useRouter()

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-2"
      onClick={() => router.back()}
    >
      <ChevronLeft className="h-4 w-4" />
      Volver
    </Button>
  )
} 