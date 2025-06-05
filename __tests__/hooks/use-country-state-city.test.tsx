import { renderHook, act } from '@testing-library/react';
import { useCountryStateCity } from '@/hooks/use-country-state-city';

// Mock country-state-city library
jest.mock('country-state-city', () => ({
  Country: {
    getAllCountries: jest.fn(() => [
      {
        name: 'Colombia',
        isoCode: 'CO',
        phonecode: '57'
      },
      {
        name: 'United States',
        isoCode: 'US',
        phonecode: '1'
      },
      {
        name: 'Venezuela',
        isoCode: 'VE',
        phonecode: '58'
      }
    ])
  },
  State: {
    getStatesOfCountry: jest.fn((countryCode: string) => {
      if (countryCode === 'CO') {
        return [
          {
            name: 'Bogotá',
            isoCode: 'DC',
            countryCode: 'CO'
          },
          {
            name: 'Valle del Cauca',
            isoCode: 'VAC',
            countryCode: 'CO'
          }
        ];
      }
      if (countryCode === 'US') {
        return [
          {
            name: 'California',
            isoCode: 'CA',
            countryCode: 'US'
          },
          {
            name: 'New York',
            isoCode: 'NY',
            countryCode: 'US'
          }
        ];
      }
      return [];
    })
  },
  City: {
    getCitiesOfState: jest.fn((countryCode: string, stateCode: string) => {
      if (countryCode === 'CO' && stateCode === 'VAC') {
        return [
          {
            name: 'Cali',
            stateCode: 'VAC',
            countryCode: 'CO'
          },
          {
            name: 'Palmira',
            stateCode: 'VAC',
            countryCode: 'CO'
          }
        ];
      }
      if (countryCode === 'US' && stateCode === 'CA') {
        return [
          {
            name: 'Los Angeles',
            stateCode: 'CA',
            countryCode: 'US'
          },
          {
            name: 'San Francisco',
            stateCode: 'CA',
            countryCode: 'US'
          }
        ];
      }
      return [];
    }),
    getCitiesOfCountry: jest.fn((countryCode: string) => {
      if (countryCode === 'VE') {
        return [
          {
            name: 'Caracas',
            stateCode: '',
            countryCode: 'VE'
          },
          {
            name: 'Maracaibo',
            stateCode: '',
            countryCode: 'VE'
          }
        ];
      }
      return [];
    })
  }
}));

describe('useCountryStateCity', () => {
  it('should initialize with empty selections', () => {
    const { result } = renderHook(() => useCountryStateCity());
    
    expect(result.current.selectedCountry).toBe('');
    expect(result.current.selectedState).toBe('');
    expect(result.current.selectedCity).toBe('');
  });

  it('should load all countries on mount', () => {
    const { result } = renderHook(() => useCountryStateCity());
    
    expect(result.current.countries).toHaveLength(3);
    expect(result.current.countries[0]).toMatchObject({
      value: 'Colombia',
      label: 'Colombia',
      code: 'CO',
      phoneCode: '57'
    });
  });

  it('should load states when country is selected', () => {
    const { result } = renderHook(() => useCountryStateCity());
    
    act(() => {
      result.current.setSelectedCountry('Colombia');
    });
    
    expect(result.current.states).toHaveLength(2);
    expect(result.current.states[0]).toMatchObject({
      value: 'Bogotá',
      label: 'Bogotá',
      countryCode: 'CO'
    });
    expect(result.current.hasStates).toBe(true);
  });

  it('should load cities when state is selected (for countries with states)', () => {
    const { result } = renderHook(() => useCountryStateCity());
    
    act(() => {
      result.current.setSelectedCountry('Colombia');
    });
    
    act(() => {
      result.current.setSelectedState('Valle del Cauca');
    });
    
    expect(result.current.cities).toHaveLength(2);
    expect(result.current.cities[0]).toMatchObject({
      value: 'Cali',
      label: 'Cali',
      stateCode: 'VAC',
      countryCode: 'CO'
    });
    expect(result.current.hasCities).toBe(true);
  });

  it('should load cities directly from country when no states exist', () => {
    const { result } = renderHook(() => useCountryStateCity());
    
    act(() => {
      result.current.setSelectedCountry('Venezuela');
    });
    
    expect(result.current.hasStates).toBe(false);
    expect(result.current.cities).toHaveLength(2);
    expect(result.current.cities[0]).toMatchObject({
      value: 'Caracas',
      label: 'Caracas',
      stateCode: '',
      countryCode: 'VE'
    });
  });

  it('should reset state and city when country changes', () => {
    const { result } = renderHook(() => useCountryStateCity());
    
    // Select country, state, and city
    act(() => {
      result.current.setSelectedCountry('Colombia');
    });
    
    act(() => {
      result.current.setSelectedState('Valle del Cauca');
    });
    
    act(() => {
      result.current.setSelectedCity('Cali');
    });
    
    expect(result.current.selectedState).toBe('Valle del Cauca');
    expect(result.current.selectedCity).toBe('Cali');
    
    // Change country
    act(() => {
      result.current.setSelectedCountry('United States');
    });
    
    expect(result.current.selectedState).toBe('');
    expect(result.current.selectedCity).toBe('');
  });

  it('should reset city when state changes', () => {
    const { result } = renderHook(() => useCountryStateCity());
    
    act(() => {
      result.current.setSelectedCountry('Colombia');
    });
    
    act(() => {
      result.current.setSelectedState('Valle del Cauca');
    });
    
    act(() => {
      result.current.setSelectedCity('Cali');
    });
    
    expect(result.current.selectedCity).toBe('Cali');
    
    // Change state
    act(() => {
      result.current.setSelectedState('Bogotá');
    });
    
    expect(result.current.selectedCity).toBe('');
  });

  it('should return correct phone code for selected country', () => {
    const { result } = renderHook(() => useCountryStateCity());
    
    // No country selected
    expect(result.current.getPhoneCode()).toBe('');
    
    // Select Colombia
    act(() => {
      result.current.setSelectedCountry('Colombia');
    });
    
    expect(result.current.getPhoneCode()).toBe('+57');
    
    // Select US
    act(() => {
      result.current.setSelectedCountry('United States');
    });
    
    expect(result.current.getPhoneCode()).toBe('+1');
  });

  it('should handle empty states array correctly', () => {
    const { result } = renderHook(() => useCountryStateCity());
    
    act(() => {
      result.current.setSelectedCountry('Venezuela');
    });
    
    expect(result.current.states).toHaveLength(0);
    expect(result.current.hasStates).toBe(false);
  });

  it('should handle errors when loading cities gracefully', () => {
    // Mock console.warn to avoid noise in tests
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    // Mock getCitiesOfState to throw error
    const mockGetCitiesOfState = require('country-state-city').City.getCitiesOfState;
    mockGetCitiesOfState.mockImplementationOnce(() => {
      throw new Error('Network error');
    });
    
    const { result } = renderHook(() => useCountryStateCity());
    
    act(() => {
      result.current.setSelectedCountry('Colombia');
    });
    
    act(() => {
      result.current.setSelectedState('Valle del Cauca');
    });
    
    expect(result.current.cities).toHaveLength(0);
    expect(consoleSpy).toHaveBeenCalledWith('Error loading cities:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });

  it('should return empty cities when invalid country is selected', () => {
    const { result } = renderHook(() => useCountryStateCity());
    
    act(() => {
      result.current.setSelectedCountry('Invalid Country');
    });
    
    expect(result.current.cities).toHaveLength(0);
    expect(result.current.hasCities).toBe(false);
  });

  it('should handle null/undefined city data', () => {
    // Mock getCitiesOfState to return null
    const mockGetCitiesOfState = require('country-state-city').City.getCitiesOfState;
    mockGetCitiesOfState.mockImplementationOnce(() => null);
    
    const { result } = renderHook(() => useCountryStateCity());
    
    act(() => {
      result.current.setSelectedCountry('Colombia');
    });
    
    act(() => {
      result.current.setSelectedState('Valle del Cauca');
    });
    
    expect(result.current.cities).toHaveLength(0);
  });
});
