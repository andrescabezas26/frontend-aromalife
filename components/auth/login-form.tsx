"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input" 
import { useState } from "react"
import { AuthService } from "@/services/auth/auth.service"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/stores/auth-store"


const formSchema = z.object({
  email: z.string()
    .min(1, { message: "El email es requerido" })
    .email({
      message: "Por favor ingresa un email válido",
    }),
  password: z.string()
    .min(1, { message: "La contraseña es requerida" })
})

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const login = useAuthStore(state => state.login)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      await login(values.email, values.password)
      
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente",
        variant: "default",
      })

      // Redireccionar al home
      router.replace('/home')    } catch (error) {
      console.error("Login form error:", error);
      
      let errorMessage = "Ha ocurrido un error inesperado. Por favor intenta de nuevo.";
      
      if (error instanceof Error) {
        // Si es un error traducido (con name TranslatedAxiosError) o cualquier otro error, usar su mensaje
        errorMessage = error.message;
        console.log("Error message from catch:", errorMessage);
        console.log("Error type:", error.name);
      }

      toast({
        title: "Error de inicio de sesión",
        description: errorMessage,
        variant: "destructive",
      });

      // Limpiar la contraseña en caso de error
      form.setValue('password', '')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="tu@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
        </Button>
      </form>
    </Form>
  )
}
