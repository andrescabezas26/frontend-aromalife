"use client"

import React, { forwardRef } from "react"
import Select, { SingleValue, ActionMeta, StylesConfig } from "react-select"
import { cn } from "@/lib/utils"

export interface Option {
  value: string
  label: string
}

interface SelectSearchableProps {
  options: Option[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  isDisabled?: boolean
  isLoading?: boolean
}

const customStyles: StylesConfig<Option, false> = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '40px',
    border: state.isFocused ? '2px solid hsl(var(--ring))' : '1px solid hsl(var(--border))',
    borderRadius: 'calc(var(--radius) - 2px)',
    boxShadow: state.isFocused ? '0 0 0 2px hsl(var(--ring))' : 'none',
    '&:hover': {
      border: state.isFocused ? '2px solid hsl(var(--ring))' : '1px solid hsl(var(--border))',
    },
    backgroundColor: 'hsl(var(--background))',
    fontSize: '14px',
    cursor: 'pointer',
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '2px 12px',
  }),
  input: (provided) => ({
    ...provided,
    margin: '0',
    padding: '0',
    color: 'hsl(var(--foreground))',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: 'hsl(var(--muted-foreground))',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    '&:hover': {
      color: 'hsl(var(--foreground))',
    },
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: 'calc(var(--radius) - 2px)',
    border: '1px solid hsl(var(--border))',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    marginTop: '4px',
    backgroundColor: 'hsl(var(--popover))',
    zIndex: 50,
  }),
  menuList: (provided) => ({
    ...provided,
    padding: '4px',
    maxHeight: '200px',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused 
      ? 'hsl(var(--accent))' 
      : state.isSelected 
        ? 'hsl(var(--primary))' 
        : 'transparent',
    color: state.isSelected 
      ? 'hsl(var(--primary-foreground))' 
      : 'hsl(var(--popover-foreground))',
    padding: '8px 12px',
    fontSize: '14px',
    borderRadius: 'calc(var(--radius) - 4px)',
    margin: '1px 0',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: 'hsl(var(--accent))',
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: 'hsl(var(--muted-foreground))',
    fontSize: '14px',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'hsl(var(--foreground))',
    fontSize: '14px',
  }),
  noOptionsMessage: (provided) => ({
    ...provided,
    color: 'hsl(var(--muted-foreground))',
    fontSize: '14px',
    padding: '8px 12px',
  }),
}

export const SelectSearchable = forwardRef<HTMLDivElement, SelectSearchableProps>(
  ({ options, value, onChange, placeholder, className, isDisabled, isLoading }, ref) => {
    const selectedOption = options.find(option => option.value === value) || null

    const handleChange = (
      newValue: SingleValue<Option>,
      actionMeta: ActionMeta<Option>
    ) => {
      if (onChange) {
        onChange(newValue ? newValue.value : '')
      }
    }

    return (
      <div ref={ref} className={cn("relative", className)}>
        <Select<Option, false>
          options={options}
          value={selectedOption}
          onChange={handleChange}
          placeholder={placeholder}
          isDisabled={isDisabled}
          isLoading={isLoading}
          styles={customStyles}
          isSearchable={true}
          isClearable={true}
          menuPlacement="auto"
          menuPosition="absolute"
          menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
          classNamePrefix="react-select"
          noOptionsMessage={() => "No se encontraron opciones"}
          loadingMessage={() => "Cargando..."}
          components={{
            IndicatorSeparator: () => null,
          }}
        />
      </div>
    )
  }
)

SelectSearchable.displayName = "SelectSearchable"
