"use client"

import { useParams } from "next/navigation"
import { EditContainerForm } from "@/components/containers/edit-container-form"

export default function EditContainerPage() {
  const params = useParams()
  const containerId = params.id as string

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <EditContainerForm containerId={containerId} />
    </div>
  )
}