export interface MainOption {
  id: string
  name: string
  description: string
  emoji: string
}

export interface IntendedImpact {
  id?: string
  name: string
  icon: string
  description: string
  mainOptionId: string
  mainOption?: MainOption
  createdAt?: string
  updatedAt?: string
}


export interface IntendedImpactTableView {
  id: string
  name: string
  description: string
  icon: string
  mainOptionName?: string | null
  mainOptionEmoji?: string | null
}