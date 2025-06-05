import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { RoleGuard } from '@/components/auth/role-guard'

// Mock dependencies
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

jest.mock('@/components/auth/role-guard', () => ({
  RoleGuard: ({ children, requiredRoles }: { children: React.ReactNode; requiredRoles: string[] }) => {
    // For testing purposes, always render children
    return <>{children}</>
  },
}))

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>

describe('AdminSidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render correctly with all navigation items', () => {
    mockUsePathname.mockReturnValue('/admin/dashboard')
    
    render(<AdminSidebar />)
    
    // Check if the main title is rendered
    expect(screen.getByText('Panel de Control')).toBeInTheDocument()
    
    // Check if main navigation items are rendered
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Usuarios')).toBeInTheDocument()
    expect(screen.getByText('Management')).toBeInTheDocument()
  })

  it('should highlight the active dashboard link', () => {
    mockUsePathname.mockReturnValue('/admin/dashboard')
    
    render(<AdminSidebar />)
    
    const dashboardButton = screen.getByRole('link', { name: /dashboard/i }).firstChild
    expect(dashboardButton).toHaveClass('bg-secondary')
  })

  it('should highlight the active users link', () => {
    mockUsePathname.mockReturnValue('/admin/users')
    
    render(<AdminSidebar />)
    
    const usersButton = screen.getByRole('link', { name: /usuarios/i }).firstChild
    expect(usersButton).toHaveClass('bg-secondary')
  })

  it('should render management collapsible section', () => {
    mockUsePathname.mockReturnValue('/admin/dashboard')
    
    render(<AdminSidebar />)
    
    const managementTrigger = screen.getByRole('button', { name: /management/i })
    expect(managementTrigger).toBeInTheDocument()
    
    // Check if management subsections are visible (should be open by default)
    expect(screen.getByText('Lugares')).toBeInTheDocument()
    expect(screen.getByText('Categorías')).toBeInTheDocument()
    expect(screen.getByText('¿Qué quiero provocar?')).toBeInTheDocument()
    expect(screen.getByText('Contenedores')).toBeInTheDocument()
    expect(screen.getByText('Aromas')).toBeInTheDocument()
    expect(screen.getByText('Regalos')).toBeInTheDocument()
    expect(screen.getByText('Etiquetas')).toBeInTheDocument()
    expect(screen.getByText('Órdenes')).toBeInTheDocument()
    expect(screen.getByText('Relaciones')).toBeInTheDocument()
  })

  it('should toggle management section when clicked', async () => {
    mockUsePathname.mockReturnValue('/admin/dashboard')
    
    render(<AdminSidebar />)
    
    const managementTrigger = screen.getByRole('button', { name: /management/i })
    
    // Management should be open by default, so clicking should close it
    fireEvent.click(managementTrigger)
    
    await waitFor(() => {
      // The chevron should rotate when collapsed
      const chevron = managementTrigger.querySelector('svg[class*="rotate-90"]')
      expect(chevron).not.toBeInTheDocument()
    })
  })

  it('should highlight active management subsection', () => {
    mockUsePathname.mockReturnValue('/admin/management/places')
    
    render(<AdminSidebar />)
    
    const placesButton = screen.getByRole('link', { name: /lugares/i }).firstChild
    expect(placesButton).toHaveClass('bg-secondary')
  })

  it('should highlight containers subsection when active', () => {
    mockUsePathname.mockReturnValue('/admin/management/containers')
    
    render(<AdminSidebar />)
    
    const containersButton = screen.getByRole('link', { name: /contenedores/i }).firstChild
    expect(containersButton).toHaveClass('bg-secondary')
  })

  it('should highlight aromas subsection when active', () => {
    mockUsePathname.mockReturnValue('/admin/management/aromas')
    
    render(<AdminSidebar />)
    
    const aromasButton = screen.getByRole('link', { name: /aromas/i }).firstChild
    expect(aromasButton).toHaveClass('bg-secondary')
  })

  it('should highlight intended impacts subsection when active', () => {
    mockUsePathname.mockReturnValue('/admin/management/intended-impacts')
    
    render(<AdminSidebar />)
    
    const intendedImpactsButton = screen.getByRole('link', { name: /¿qué quiero provocar\?/i }).firstChild
    expect(intendedImpactsButton).toHaveClass('bg-secondary')
  })

  it('should highlight labels subsection when active', () => {
    mockUsePathname.mockReturnValue('/admin/management/labels')
    
    render(<AdminSidebar />)
    
    const labelsButton = screen.getByRole('link', { name: /etiquetas/i }).firstChild
    expect(labelsButton).toHaveClass('bg-secondary')
  })

  it('should highlight orders subsection when active', () => {
    mockUsePathname.mockReturnValue('/admin/management/orders')
    
    render(<AdminSidebar />)
    
    const ordersButton = screen.getByRole('link', { name: /órdenes/i }).firstChild
    expect(ordersButton).toHaveClass('bg-secondary')
  })

  it('should have correct href attributes for all links', () => {
    mockUsePathname.mockReturnValue('/admin/dashboard')
    
    render(<AdminSidebar />)
    
    // Check main navigation links
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/admin/dashboard')
    expect(screen.getByRole('link', { name: /usuarios/i })).toHaveAttribute('href', '/admin/users')
    
    // Check management subsection links
    expect(screen.getByRole('link', { name: /lugares/i })).toHaveAttribute('href', '/admin/management/places')
    expect(screen.getByRole('link', { name: /categorías/i })).toHaveAttribute('href', '/admin/management/main-options')
    expect(screen.getByRole('link', { name: /¿qué quiero provocar\?/i })).toHaveAttribute('href', '/admin/management/intended-impacts')
    expect(screen.getByRole('link', { name: /contenedores/i })).toHaveAttribute('href', '/admin/management/containers')
    expect(screen.getByRole('link', { name: /aromas/i })).toHaveAttribute('href', '/admin/management/aromas')
    expect(screen.getByRole('link', { name: /regalos/i })).toHaveAttribute('href', '/admin/management/gifts')
    expect(screen.getByRole('link', { name: /etiquetas/i })).toHaveAttribute('href', '/admin/management/labels')
    expect(screen.getByRole('link', { name: /órdenes/i })).toHaveAttribute('href', '/admin/management/orders')
    expect(screen.getByRole('link', { name: /relaciones/i })).toHaveAttribute('href', '/admin/management/relations')
  })

  it('should render with proper accessibility attributes', () => {
    mockUsePathname.mockReturnValue('/admin/dashboard')
    
    render(<AdminSidebar />)
    
    // Check if navigation buttons are properly labeled
    const managementButton = screen.getByRole('button', { name: /management/i })
    expect(managementButton).toBeInTheDocument()
    
    // Check if all links are accessible
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
    
    links.forEach(link => {
      expect(link).toHaveAttribute('href')
    })
  })

  it('should display correct icons for each navigation item', () => {
    mockUsePathname.mockReturnValue('/admin/dashboard')
    
    render(<AdminSidebar />)
    
    // Check if icons are rendered (we can't test specific icons easily, but we can check if they exist)
    const buttons = screen.getAllByRole('button')
    const links = screen.getAllByRole('link')
      // Each button and link should have an icon (svg element)
    const allElements = buttons.concat(links)
    allElements.forEach(element => {
      const hasIcon = element.querySelector('svg') !== null
      expect(hasIcon).toBe(true)
    })
  })
})
