"use client"

import { useState, useEffect, useMemo } from "react"
import { Country, State, City } from "country-state-city"
import { Option } from "@/components/ui/select-searchable"

export interface CountryOption extends Option {
  code: string
  phoneCode: string
}

export interface StateOption extends Option {
  countryCode: string
}

export interface CityOption extends Option {
  stateCode: string
  countryCode: string
}

export function useCountryStateCity() {
  const [selectedCountry, setSelectedCountry] = useState<string>("")
  const [selectedState, setSelectedState] = useState<string>("")
  const [selectedCity, setSelectedCity] = useState<string>("")

  // Obtener todos los países
  const countries: CountryOption[] = useMemo(() => {
    return Country.getAllCountries().map(country => ({
      value: country.name,
      label: country.name,
      code: country.isoCode,
      phoneCode: country.phonecode
    }))
  }, [])

  // Obtener estados/provincias del país seleccionado
  const states: StateOption[] = useMemo(() => {
    if (!selectedCountry) return []
    
    const country = countries.find(c => c.value === selectedCountry)
    if (!country) return []

    return State.getStatesOfCountry(country.code).map(state => ({
      value: state.name,
      label: state.name,
      countryCode: state.countryCode
    }))
  }, [selectedCountry, countries])

  // Verificar si el país tiene estados
  const hasStates = states.length > 0

  // Obtener ciudades del estado seleccionado o país si no hay estados
  const cities: CityOption[] = useMemo(() => {
    if (!selectedCountry) return []
    
    const country = countries.find(c => c.value === selectedCountry)
    if (!country) return []

    try {
      if (hasStates && selectedState) {
        // Si hay estados y se seleccionó uno, obtener ciudades del estado
        const stateData = State.getStatesOfCountry(country.code).find(s => s.name === selectedState)
        if (!stateData) return []

        const citiesData = City.getCitiesOfState(country.code, stateData.isoCode)
        return citiesData?.map(city => ({
          value: city.name,
          label: city.name,
          stateCode: city.stateCode || "",
          countryCode: city.countryCode
        })) || []
      } else if (!hasStates) {
        // Si no hay estados, obtener ciudades directamente del país
        const citiesData = City.getCitiesOfCountry(country.code)
        return citiesData?.map(city => ({
          value: city.name,
          label: city.name,
          stateCode: city.stateCode || "",
          countryCode: city.countryCode
        })) || []
      }
    } catch (error) {
      console.warn('Error loading cities:', error)
      return []
    }
    
    return []
  }, [selectedCountry, selectedState, countries, states, hasStates])

  // Resetear estado y ciudad cuando cambia el país
  useEffect(() => {
    setSelectedState("")
    setSelectedCity("")
  }, [selectedCountry])

  // Resetear ciudad cuando cambia el estado
  useEffect(() => {
    setSelectedCity("")
  }, [selectedState])

  // Obtener código de teléfono del país seleccionado
  const getPhoneCode = (): string => {
    const country = countries.find(c => c.value === selectedCountry)
    return country ? `+${country.phoneCode}` : ""
  }

  return {
    // Datos
    countries,
    states,
    cities,
    
    // Valores seleccionados
    selectedCountry,
    selectedState,
    selectedCity,
    
    // Setters
    setSelectedCountry,
    setSelectedState,
    setSelectedCity,
    
    // Utilidades
    getPhoneCode,
    
    // Estados de carga
    hasStates,
    hasCities: cities.length > 0
  }
}
