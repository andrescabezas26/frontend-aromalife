"use client"

import { useParams } from "next/navigation"
import { EditGiftForm } from "@/components/gifts/edit-gift-form"

export default function EditGiftPage() {
  const params = useParams()
  const giftId = params.id as string

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <EditGiftForm giftId={giftId} />
    </div>
  )
} 