"use client"

import { useParams } from "next/navigation"
import { EditMainOptionForm } from "@/components/main-options/edit-main-option-form"

export default function EditMainOptionPage() {
  const params = useParams()
  const mainOptionId = params.id as string

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <EditMainOptionForm mainOptionId={mainOptionId} />
    </div>
  )
}
