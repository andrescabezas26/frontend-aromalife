import { RegisterClientForm } from "@/components/users/create-client-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { RoleGuard } from "@/components/auth/role-guard"

export default function RegisterClientPage() {
  return (
    <RoleGuard requiredRoles={["admin"]}>
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Registro de clientes del administrador</CardTitle>
          </CardHeader>
          <CardContent>
            <RegisterClientForm />
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
}
