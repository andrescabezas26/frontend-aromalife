import React from 'react'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '../../components/theme-provider'

// Mock next-themes
jest.mock('next-themes', () => ({
    ThemeProvider: ({ children, ...props }: any) => (
        <div data-testid="theme-provider" {...props}>
            {children}
        </div>
    ),
}))

describe('ThemeProvider', () => {
    it('should render children correctly', () => {
        render(
            <ThemeProvider>
                <div data-testid="child">Test Child</div>
            </ThemeProvider>
        )

        expect(screen.getByTestId('child')).toBeInTheDocument()
        expect(screen.getByText('Test Child')).toBeInTheDocument()
    })

    it('should pass props to NextThemesProvider', () => {
        const testProps = {
            attribute: 'class',
            defaultTheme: 'dark',
            enableSystem: true,
        }

        render(
            <ThemeProvider {...testProps}>
                <div>Content</div>
            </ThemeProvider>
        )

        const provider = screen.getByTestId('theme-provider')
        expect(provider).toHaveAttribute('attribute', 'class')
        expect(provider).toHaveAttribute('defaultTheme', 'dark')
    })

    it('should render without props', () => {
        render(
            <ThemeProvider>
                <div data-testid="content">Content</div>
            </ThemeProvider>
        )

        expect(screen.getByTestId('theme-provider')).toBeInTheDocument()
        expect(screen.getByTestId('content')).toBeInTheDocument()
    })
})