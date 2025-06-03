"use client"

import React, { useState } from "react"
import Select from "react-select"

const simpleOptions = [
  { value: 'colombia', label: 'Colombia' },
  { value: 'venezuela', label: 'Venezuela' },
  { value: 'peru', label: 'Perú' },
  { value: 'ecuador', label: 'Ecuador' },
]

export function TestSelect() {
  const [selectedValue, setSelectedValue] = useState<string>("")

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-4">Test de React Select</h2>
      <Select
        options={simpleOptions}
        placeholder="Selecciona un país"
        isSearchable
        isClearable
        onChange={(option) => setSelectedValue(option ? option.value : "")}
        styles={{
          control: (provided) => ({
            ...provided,
            minHeight: '40px',
            border: '1px solid #ccc',
            borderRadius: '6px',
            cursor: 'pointer',
          }),
          menu: (provided) => ({
            ...provided,
            zIndex: 9999,
          }),
        }}
      />
      <p className="mt-2 text-sm text-gray-600">
        Valor seleccionado: {selectedValue || "Ninguno"}
      </p>
    </div>
  )
}
