"use client"
import { AuthService } from "@/services/auth/auth.service"
import { RegisterClientRequest } from "@/auth"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useCountryStateCity } from "@/hooks/use-country-state-city"
import { SelectSearchable } from "../ui/select-searchable"

// Esquema actualizado para coincidir con el DTO
const formSchema = z.object({
  name: z.string()
    .min(1, { message: "El nombre es requerido" })
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" })
    .max(50, { message: "El nombre no puede tener más de 50 caracteres" })
    .regex(/^[a-zA-ZÀ-ÿ\s]{2,}$/, {
      message: "El nombre solo puede contener letras y espacios"
    }),
  lastName: z.string()
    .min(1, { message: "El apellido es requerido" })
    .min(2, { message: "El apellido debe tener al menos 2 caracteres" })
    .max(50, { message: "El apellido no puede tener más de 50 caracteres" })
    .regex(/^[a-zA-ZÀ-ÿ\s]{2,}$/, {
      message: "El apellido solo puede contener letras y espacios"
    }),
  email: z.string()
    .min(1, { message: "El email es requerido" })
    .email({ message: "Por favor ingresa un email válido" })
    .max(100, { message: "El email no puede tener más de 100 caracteres" }),
  password: z.string()
    .min(1, { message: "La contraseña es requerida" })
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" })
    .max(50, { message: "La contraseña no puede tener más de 50 caracteres" })
    .regex(/[A-Z]/, { message: "La contraseña debe tener al menos una mayúscula" })
    .regex(/[0-9]/, { message: "La contraseña debe tener al menos un número" })
    .regex(/[!@#$%^&*]/, { message: "La contraseña debe tener al menos un carácter especial (!@#$%^&*)" }),
  phone: z.string()
    .min(1, { message: "El teléfono es requerido" })
    .regex(/^[\+]?[1-9][\d]{0,15}$/, {
      message: "Por favor ingresa un número de teléfono válido"
    }),
  phoneCountryCode: z.string()
    .min(1, { message: "El código de país es requerido" })
    .max(5, { message: "El código de país no puede tener más de 5 caracteres" }),
  city: z.string()
    .min(1, { message: "La ciudad es requerida" })
    .min(2, { message: "La ciudad debe tener al menos 2 caracteres" })
    .max(50, { message: "La ciudad no puede tener más de 50 caracteres" }),
  state: z.string()
    .min(2, { message: "El estado/provincia debe tener al menos 2 caracteres" })
    .max(50, { message: "El estado/provincia no puede tener más de 50 caracteres" })
    .optional(),
  country: z.string()
    .min(1, { message: "El país es requerido" })
    .min(2, { message: "El país debe tener al menos 2 caracteres" })
    .max(50, { message: "El país no puede tener más de 50 caracteres" }),
  address: z.string()
    .min(1, { message: "La dirección es requerida" })
    .min(5, { message: "La dirección debe tener al menos 5 caracteres" })
    .max(200, { message: "La dirección no puede tener más de 200 caracteres" }),
  roles: z.array(z.enum(["admin", "client", "manager"]))
    .min(1, { message: "Debe seleccionar al menos un rol" })
})

type FormValues = z.infer<typeof formSchema>

export function RegisterClientForm() {
  const [isLoading, setIsLoading] = useState(false)
    const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null)
    const [selectedPhoneCode, setSelectedPhoneCode] = useState<string>("")
    const router = useRouter()
    const { toast } = useToast()
    
    const {
      countries,
      states,
      cities,
      selectedCountry,
      selectedState,
      selectedCity,
      setSelectedCountry,
      setSelectedState,
      setSelectedCity,
      getPhoneCode,
    } = useCountryStateCity()
  
    // Crear lista de códigos de teléfono
    const phoneCodes = countries.map(country => ({
      value: `+${country.phoneCode}`,
      label: `${country.label} (+${country.phoneCode})`,
    })).filter((code, index, self) => 
      // Filtrar duplicados basados en el valor del código
      index === self.findIndex(c => c.value === code.value)
    ).sort((a, b) => a.label.localeCompare(b.label))
  
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        name: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        phoneCountryCode: "",
        city: "",
        state: "",
        country: "",
        address: "",
        roles: ["client"],
      },
    })
  
    // Sincronizar los valores del hook con el formulario
    useEffect(() => {
      if (selectedCountry) {
        form.setValue('country', selectedCountry)
        const phoneCode = getPhoneCode()
        if (phoneCode) {
          setSelectedPhoneCode(phoneCode)
          form.setValue('phoneCountryCode', phoneCode)
        }
      }
    }, [selectedCountry, form, getPhoneCode])
  
    useEffect(() => {
      if (selectedState) {
        form.setValue('state', selectedState)
      }
    }, [selectedState, form])
  
    useEffect(() => {
      if (selectedCity) {
        form.setValue('city', selectedCity)
      }
    }, [selectedCity, form])


 

  async function onSubmit(values: FormValues) {
    try {
      setIsLoading(true)

      // Usar el servicio AuthService que ya maneja el bearer token
      const result = await AuthService.registerClient(values as RegisterClientRequest)

      toast({
        title: "¡Registro exitoso!",
        description: `Usuario ${result.name} registrado correctamente.`,
      })

      // Limpiar formulario
      form.reset()

      // Opcional: redireccionar
      // router.push('/admin/users')

    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Error en el registro",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "Ha ocurrido un error inesperado. Por favor intenta de nuevo.",
          variant: "destructive",
        })
      }

      // Limpiar la contraseña en caso de error
      form.setValue('password', '')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Tu nombre" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido</FormLabel>
                <FormControl>
                  <Input placeholder="Tu apellido" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="tu@email.com" {...field} />
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
                <Input type="password" placeholder="Tu contraseña" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="phoneCountryCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código País</FormLabel>
                <FormControl>
                  <SelectSearchable
                    options={phoneCodes}
                    value={selectedPhoneCode}
                    onChange={(value) => {
                      setSelectedPhoneCode(value)
                      field.onChange(value)
                    }}
                    placeholder="Código"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu numero de celular" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>País</FormLabel>
                <FormControl>
                  <SelectSearchable
                    options={countries}
                    value={selectedCountry}
                    onChange={(value) => {
                      setSelectedCountry(value)
                      field.onChange(value)
                    }}
                    placeholder="Selecciona tu país"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado/Provincia</FormLabel>
                <FormControl>
                  <SelectSearchable
                    options={states}
                    value={selectedState}
                    onChange={(value) => {
                      setSelectedState(value)
                      field.onChange(value)
                    }}
                    placeholder="Selecciona tu estado"
                    isDisabled={!selectedCountry || states.length === 0}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ciudad</FormLabel>
              <FormControl>
                <SelectSearchable
                  options={cities}
                  value={selectedCity}
                  onChange={(value) => {
                    setSelectedCity(value)
                    field.onChange(value)
                  }}
                  placeholder="Selecciona tu ciudad"
                  isDisabled={(!selectedCountry) || (states.length > 0 && !selectedState)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Input placeholder="Tu dirección completa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />  

        <FormField
          control={form.control}
          name="roles"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Roles</FormLabel>
              <FormControl>
                <Select
                  value={field.value[0] || ""}
                  onValueChange={(value) => field.onChange([value])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Cliente</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Registrando..." : "Registrar Usuario"}
        </Button>
      </form>
    </Form>
  )
}
