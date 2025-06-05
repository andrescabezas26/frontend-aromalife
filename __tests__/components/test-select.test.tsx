import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TestSelect } from '@/components/test-select';

// test/components/test-select.test.tsx

describe('TestSelect', () => {
  it('renders correctly with initial state', () => {
    render(<TestSelect />);
    
    expect(screen.getByText('Test de React Select')).toBeInTheDocument();
    expect(screen.getByText('Selecciona un país')).toBeInTheDocument();
    expect(screen.getByText('Valor seleccionado: Ninguno')).toBeInTheDocument();
  });

  it('displays placeholder text', () => {
    render(<TestSelect />);
    
    expect(screen.getByText('Selecciona un país')).toBeInTheDocument();
  });

  it('shows options when select is clicked', async () => {
    const user = userEvent.setup();
    render(<TestSelect />);
    
    const selectContainer = screen.getByText('Selecciona un país').closest('[class*="control"]');
    await user.click(selectContainer!);
    
    await waitFor(() => {
      expect(screen.getByText('Colombia')).toBeInTheDocument();
      expect(screen.getByText('Venezuela')).toBeInTheDocument();
      expect(screen.getByText('Perú')).toBeInTheDocument();
      expect(screen.getByText('Ecuador')).toBeInTheDocument();
    });
  });

  it('updates selected value when an option is selected', async () => {
    const user = userEvent.setup();
    render(<TestSelect />);
    
    const selectContainer = screen.getByText('Selecciona un país').closest('[class*="control"]');
    await user.click(selectContainer!);
    
    await waitFor(() => {
      expect(screen.getByText('Colombia')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Colombia'));
    
    await waitFor(() => {
      expect(screen.getByText('Valor seleccionado: colombia')).toBeInTheDocument();
    });
  });

  it('clears selection when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<TestSelect />);
    
    // First select an option
    const selectContainer = screen.getByText('Selecciona un país').closest('[class*="control"]');
    await user.click(selectContainer!);
    
    await waitFor(() => {
      expect(screen.getByText('Colombia')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Colombia'));
    
    await waitFor(() => {
      expect(screen.getByText('Valor seleccionado: colombia')).toBeInTheDocument();
    });
    
  });

  it('filters options when searching', async () => {
    const user = userEvent.setup();
    render(<TestSelect />);
    
    const selectInput = screen.getByRole('combobox');
    await user.click(selectInput);
    await user.type(selectInput, 'col');
    
    await waitFor(() => {
      expect(screen.getByText('Colombia')).toBeInTheDocument();
      expect(screen.queryByText('Venezuela')).not.toBeInTheDocument();
      expect(screen.queryByText('Perú')).not.toBeInTheDocument();
      expect(screen.queryByText('Ecuador')).not.toBeInTheDocument();
    });
  });

  it('shows no options message when search yields no results', async () => {
    const user = userEvent.setup();
    render(<TestSelect />);
    
    const selectInput = screen.getByRole('combobox');
    await user.click(selectInput);
    await user.type(selectInput, 'xyz');
    
    await waitFor(() => {
      expect(screen.getByText('No options')).toBeInTheDocument();
    });
  });

  it('handles multiple selections and deselections', async () => {
    const user = userEvent.setup();
    render(<TestSelect />);
    
    const selectContainer = screen.getByText('Selecciona un país').closest('[class*="control"]');
    
    // Select Colombia
    await user.click(selectContainer!);
    await waitFor(() => expect(screen.getByText('Colombia')).toBeInTheDocument());
    await user.click(screen.getByText('Colombia'));
    
    await waitFor(() => {
      expect(screen.getByText('Valor seleccionado: colombia')).toBeInTheDocument();
    });
    
    // Change to Venezuela
    await user.click(selectContainer!);
    await waitFor(() => expect(screen.getByText('Venezuela')).toBeInTheDocument());
    await user.click(screen.getByText('Venezuela'));
    
    await waitFor(() => {
      expect(screen.getByText('Valor seleccionado: venezuela')).toBeInTheDocument();
    });
  });
});