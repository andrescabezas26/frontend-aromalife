"use client"

import { useParams } from "next/navigation"
import { EditAromaForm } from "@/components/aromas/edit-aroma-form"

export default function EditAromaPage() {
  const params = useParams()
  const aromaId = params.id as string

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <EditAromaForm aromaId={aromaId} />
    </div>
  )
} 