import { User } from "@/types/user"
import { EditUserForm } from "./edit-user-form"
import { DeleteUserButton } from "./delete-user-button"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface UsersTableProps {
  users: User[]
  onDelete: (user: User) => Promise<void>
}

export function UsersTable({ users }: UsersTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Link 
                  href={`/profile/${user.id}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {user.name}
                </Link>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.roles.join(", ")}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <EditUserForm user={user} />
                  <DeleteUserButton userId={user.id} userName={user.name} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 