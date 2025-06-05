import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EditUserForm } from '../../../components/users/edit-user-form';
import { useAdminUsersStore } from '@/stores/users-store';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types/user';

// Mock de las dependencias
jest.mock('@/stores/users-store');
jest.mock('@/hooks/use-toast');
jest.mock('lucide-react', () => ({
  Pencil: () => <span>PencilIcon</span>,
}));

// Mock del componente Checkbox
jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<'button'> & { checked?: boolean; onCheckedChange?: (checked: boolean) => void }
  >(({ checked, onCheckedChange, ...props }, ref) => (
    <input
      ref={ref as React.RefObject<HTMLInputElement>}
      type="checkbox"
      checked={checked || false}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
  )),
}));

// Mock de otros componentes UI
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
    (props, ref) => <input ref={ref} {...props} />
  ),
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
}));

const mockUpdateUser = jest.fn();
const mockUpdateUserRoles = jest.fn();
const mockToast = jest.fn();

const mockUser: User = {
  id: '1',
  name: 'John Doe',
  lastName: 'Doe',
  email: 'john@example.com',
  roles: ['client'],
  phone: '1234567890',
  phoneCountryCode: '+1',
  city: 'New York',
  state: 'NY',
  country: 'USA',
  address: '123 Main St',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  (useAdminUsersStore as unknown as jest.Mock).mockReturnValue({
    updateUser: mockUpdateUser,
    updateUserRoles: mockUpdateUserRoles,
    loading: false,
  });
  
  (useToast as jest.Mock).mockReturnValue({
    toast: mockToast,
  });
  
  mockUpdateUser.mockReset();
  mockUpdateUserRoles.mockReset();
  mockToast.mockReset();
});

describe('EditUserForm', () => {
  test('renderiza correctamente el formulario con los datos del usuario', () => {
    render(<EditUserForm user={mockUser} />);
    
    // Abre el diálogo
    fireEvent.click(screen.getByRole('button', { name: /pencilicon/i }));
    
    expect(screen.getByText('Editar Usuario')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre')).toHaveValue(mockUser.name);
    expect(screen.getByLabelText('Email')).toHaveValue(mockUser.email);
      // Verifica los checkboxes de roles
    expect(screen.getByLabelText('admin')).not.toBeChecked();
    expect(screen.getByLabelText('client')).toBeChecked();
    expect(screen.getByLabelText('manager')).not.toBeChecked();
  });

  test('permite editar el nombre y email', () => {
    render(<EditUserForm user={mockUser} />);
    fireEvent.click(screen.getByRole('button', { name: /pencilicon/i }));
    
    const nameInput = screen.getByLabelText('Nombre');
    const emailInput = screen.getByLabelText('Email');
    
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    
    expect(nameInput).toHaveValue('New Name');
    expect(emailInput).toHaveValue('new@example.com');
  });
  test('permite cambiar los roles', () => {
    render(<EditUserForm user={mockUser} />);
    fireEvent.click(screen.getByRole('button', { name: /pencilicon/i }));
    
    const adminCheckbox = screen.getByLabelText('admin');
    const clientCheckbox = screen.getByLabelText('client');
    
    // Añadir rol admin
    fireEvent.click(adminCheckbox);
    expect(adminCheckbox).toBeChecked();
    
    // Quitar rol client
    fireEvent.click(clientCheckbox);
    expect(clientCheckbox).not.toBeChecked();
  });

  test('envía los datos actualizados correctamente', async () => {
    mockUpdateUser.mockResolvedValueOnce(undefined);
    mockUpdateUserRoles.mockResolvedValueOnce(undefined);
    
    render(<EditUserForm user={mockUser} />);
    fireEvent.click(screen.getByRole('button', { name: /pencilicon/i }));
      // Editar campos
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'New Name' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'new@example.com' } });
    fireEvent.click(screen.getByLabelText('admin'));
      // Enviar formulario
    fireEvent.click(screen.getByText('Actualizar'));
      await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith('1', {
        name: 'New Name',
        email: 'new@example.com',
        phone: '1234567890',
        phoneCountryCode: '+1',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
      });
      
      expect(mockUpdateUserRoles).toHaveBeenCalledWith('1', ['client', 'admin']);
      
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Usuario actualizado',
        description: 'El usuario ha sido actualizado correctamente',
        variant: 'default',      });
      
    });
    
   
  });
  test('muestra error cuando falla la actualización de datos básicos', async () => {
    const error = new Error('Error de red');
    mockUpdateUser.mockRejectedValueOnce(error);
    
    render(<EditUserForm user={mockUser} />);
    fireEvent.click(screen.getByRole('button', { name: /pencilicon/i }));
    fireEvent.click(screen.getByText('Actualizar'));
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error al actualizar',
        description: 'Error de red',
        variant: 'destructive',
      });
    });
  });
  test('muestra error cuando falla la actualización de roles', async () => {
    const error = new Error('Error de permisos');
    mockUpdateUser.mockResolvedValueOnce(undefined);
    mockUpdateUserRoles.mockRejectedValueOnce(error);
    
    render(<EditUserForm user={mockUser} />);
    fireEvent.click(screen.getByRole('button', { name: /pencilicon/i }));
    fireEvent.click(screen.getByText('Actualizar'));
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error al actualizar',
        description: 'Error de permisos',
        variant: 'destructive',
      });
    });
  });
  test('muestra error genérico cuando ocurre un error desconocido', async () => {
    mockUpdateUser.mockRejectedValueOnce('Error desconocido');
    
    render(<EditUserForm user={mockUser} />);
    fireEvent.click(screen.getByRole('button', { name: /pencilicon/i }));
    fireEvent.click(screen.getByText('Actualizar'));
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Ha ocurrido un error inesperado. Por favor intenta de nuevo.',
        variant: 'destructive',
      });
    });
  });

  test('muestra estado de carga mientras se envía el formulario', async () => {
    (useAdminUsersStore as unknown as jest.Mock).mockReturnValueOnce({
      updateUser: mockUpdateUser,
      updateUserRoles: mockUpdateUserRoles,
      loading: true,
    });
      render(<EditUserForm user={mockUser} />);
    fireEvent.click(screen.getByRole('button', { name: /pencilicon/i }));
    
    expect(screen.getByText('Actualizando...')).toBeDisabled();
  });

  test('valida que los campos requeridos estén completos', () => {
    render(<EditUserForm user={mockUser} />);
    fireEvent.click(screen.getByRole('button', { name: /pencilicon/i }));
    
    // Vaciar campos requeridos
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: '' } });
    
    fireEvent.click(screen.getByText('Actualizar'));
    
    expect(mockUpdateUser).not.toHaveBeenCalled();
    expect(mockUpdateUserRoles).not.toHaveBeenCalled();
  });
});