"use client"

import { useParams } from "next/navigation"
import { EditPlaceForm } from "@/components/places/edit-place-form"
import { RoleGuard } from "@/components/auth/role-guard"

export default function EditPlacePage() {
  const params = useParams()
  const placeId = params.id as string

  return (
    <RoleGuard requiredRoles={["admin", "manager"]} hideContent={false}>
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <EditPlaceForm placeId={placeId} />
      </div>
    </RoleGuard>
  )
}
