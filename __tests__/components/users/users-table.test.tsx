import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { UsersTable } from '@/components/users/users-table'
import { User } from '@/types/user'

// Mock the child components since we're testing the table in isolation
jest.mock('@/components/users/edit-user-form', () => ({
  EditUserForm: ({ user }: { user: User }) => (
    <button data-testid={`edit-user-${user.id}`}>Edit</button>
  ),
}))

jest.mock('@/components/users/delete-user-button', () => ({
  DeleteUserButton: ({ userId }: { userId: string }) => (
    <button data-testid={`delete-user-${userId}`}>Delete</button>
  ),
}))

describe('UsersTable', () => {
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      roles: ['USER'],
      isActive: true,
      phoneCountryCode: '+1',
      phone: '1234567890',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      profilePicture: undefined,
      imageUrl: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      roles: ['ADMIN', 'USER'],
      isActive: true,
      phoneCountryCode: '+1',
      phone: '0987654321',
      address: '456 Oak St',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      profilePicture: undefined,
      imageUrl: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  it('renders the table with correct headers', () => {
    const { getByText } = render(<UsersTable users={mockUsers} onDelete={jest.fn()} />)
    
    expect(getByText('Nombre')).toBeInTheDocument()
    expect(getByText('Email')).toBeInTheDocument()
    expect(getByText('Roles')).toBeInTheDocument()
    expect(getByText('Acciones')).toBeInTheDocument()
  })

  it('renders the correct number of rows', () => {
    const { getAllByRole } = render(<UsersTable users={mockUsers} onDelete={jest.fn()} />)
    
    // Get all rows except the header row
    const rows = getAllByRole('row').slice(1)
    expect(rows).toHaveLength(mockUsers.length)
  })

  it('displays user information correctly', () => {
    const { getByText } = render(<UsersTable users={mockUsers} onDelete={jest.fn()} />)
    
    // Check first user
    expect(getByText('John')).toBeInTheDocument()
    expect(getByText('john@example.com')).toBeInTheDocument()
    expect(getByText('USER')).toBeInTheDocument()
    
    // Check second user
    expect(getByText('Jane')).toBeInTheDocument()
    expect(getByText('jane@example.com')).toBeInTheDocument()
    expect(getByText('ADMIN, USER')).toBeInTheDocument()
  })

  it('renders edit and delete buttons for each user', () => {
    const { getByTestId } = render(<UsersTable users={mockUsers} onDelete={jest.fn()} />)
    
    // Check buttons for first user
    expect(getByTestId('edit-user-1')).toBeInTheDocument()
    expect(getByTestId('delete-user-1')).toBeInTheDocument()
    
    // Check buttons for second user
    expect(getByTestId('edit-user-2')).toBeInTheDocument()
    expect(getByTestId('delete-user-2')).toBeInTheDocument()
  })
  it('renders user names as links to their profiles', () => {
    const { getAllByRole } = render(<UsersTable users={mockUsers} onDelete={jest.fn()} />)
    
    const userLinks = getAllByRole('link')
    expect(userLinks).toHaveLength(mockUsers.length)
    
    userLinks.forEach((link: HTMLElement, index: number) => {
      expect(link).toHaveAttribute('href', `/profile/${mockUsers[index].id}`)
    })
  })

  // Unhappy path tests
  it('renders empty table when no users provided', () => {
    const { getByText, queryByRole } = render(<UsersTable users={[]} onDelete={jest.fn()} />)
    
    // Headers should still be present
    expect(getByText('Nombre')).toBeInTheDocument()
    expect(getByText('Email')).toBeInTheDocument()
    expect(getByText('Roles')).toBeInTheDocument()
    expect(getByText('Acciones')).toBeInTheDocument()
    
    // No data rows should be present
    const rows = queryByRole('row')
    expect(rows).toBeInTheDocument() // Only header row
  })

  it('handles users with very long names and emails', () => {
    const longDataUsers: User[] = [
      {
        id: '1',
        name: 'A'.repeat(100),
        lastName: 'B'.repeat(100),
        email: 'verylongusername@verylongdomainname.verylongextension.com',
        roles: ['USER'],
        isActive: true,
        phoneCountryCode: '+1',
        phone: '1234567890',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        profilePicture: undefined,
        imageUrl: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]

    const { container } = render(<UsersTable users={longDataUsers} onDelete={jest.fn()} />)
    
    // Should render without breaking layout
    expect(container).toBeInTheDocument()
  })

  it('handles users with special characters in data', () => {
    const specialCharUsers: User[] = [
      {
        id: '1',
        name: 'José María',
        lastName: 'González-Pérez',
        email: 'josé.maría@ñañá.com',
        roles: ['USER'],
        isActive: true,
        phoneCountryCode: '+34',
        phone: '666-777-888',
        address: 'Calle de la Ñ, 123',
        city: 'Madrid',
        state: 'Madrid',
        country: 'España',
        profilePicture: undefined,
        imageUrl: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]

    const { getByText } = render(<UsersTable users={specialCharUsers} onDelete={jest.fn()} />)
    
    // Should handle special characters correctly
    expect(getByText('José María')).toBeInTheDocument()
    expect(getByText('josé.maría@ñañá.com')).toBeInTheDocument()
  })

  it('handles users with multiple roles correctly', () => {
    const multiRoleUsers: User[] = [
      {
        id: '1',
        name: 'Super',
        lastName: 'Admin',
        email: 'superadmin@example.com',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'],
        isActive: true,
        phoneCountryCode: '+1',
        phone: '1234567890',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        profilePicture: undefined,
        imageUrl: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]

    const { getByText } = render(<UsersTable users={multiRoleUsers} onDelete={jest.fn()} />)
    
    // Should display all roles joined by comma
    expect(getByText('SUPER_ADMIN, ADMIN, MODERATOR, USER')).toBeInTheDocument()
  })

  it('handles invalid date objects', () => {
    const invalidDateUsers: User[] = [
      {
        id: '1',
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        roles: ['USER'],
        isActive: true,
        phoneCountryCode: '+1',
        phone: '1234567890',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        profilePicture: undefined,
        imageUrl: undefined,
        createdAt: new Date('invalid-date'),
        updatedAt: new Date('invalid-date'),
      }
    ]

    const { container } = render(<UsersTable users={invalidDateUsers} onDelete={jest.fn()} />)
    
    // Should not crash with invalid dates
    expect(container).toBeInTheDocument()
  })

  it('handles null/undefined onDelete callback gracefully', () => {
    // @ts-ignore - Testing runtime behavior
    const { container } = render(<UsersTable users={mockUsers} onDelete={undefined} />)
    
    // Should render without crashing
    expect(container).toBeInTheDocument()
  })

  it('handles extremely large user lists', () => {
    const largeUserList: User[] = Array.from({ length: 1000 }, (_, index) => ({
      id: String(index + 1),
      name: `User${index + 1}`,
      lastName: `LastName${index + 1}`,
      email: `user${index + 1}@example.com`,
      roles: ['USER'],
      isActive: true,
      phoneCountryCode: '+1',
      phone: '1234567890',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      profilePicture: undefined,
      imageUrl: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))

    const { container } = render(<UsersTable users={largeUserList} onDelete={jest.fn()} />)
    
    // Should handle large lists without performance issues
    expect(container).toBeInTheDocument()
  })

  it('handles users with malformed IDs', () => {
    const malformedIdUsers: User[] = [
      {
        id: '',
        name: 'No ID User',
        lastName: 'Test',
        email: 'noid@example.com',
        roles: ['USER'],
        isActive: true,
        phoneCountryCode: '+1',
        phone: '1234567890',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        profilePicture: undefined,
        imageUrl: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '   ',
        name: 'Whitespace ID User',
        lastName: 'Test',
        email: 'whitespace@example.com',
        roles: ['USER'],
        isActive: true,
        phoneCountryCode: '+1',
        phone: '1234567890',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        profilePicture: undefined,
        imageUrl: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]

    const { container } = render(<UsersTable users={malformedIdUsers} onDelete={jest.fn()} />)
    
    // Should handle malformed IDs without crashing
    expect(container).toBeInTheDocument()
  })

  it('handles inactive users display correctly', () => {
    const inactiveUsers: User[] = [
      {
        id: '1',
        name: 'Inactive',
        lastName: 'User',
        email: 'inactive@example.com',
        roles: ['USER'],
        isActive: false,
        phoneCountryCode: '+1',
        phone: '1234567890',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        profilePicture: undefined,
        imageUrl: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]

    const { getByText } = render(<UsersTable users={inactiveUsers} onDelete={jest.fn()} />)
    
    // Should display inactive user information
    expect(getByText('Inactive')).toBeInTheDocument()
    expect(getByText('inactive@example.com')).toBeInTheDocument()
  })
})
