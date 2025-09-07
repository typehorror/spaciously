// Type for habitat (item storage)
export type NewHabitat = {
  population: number
  capacity: number
}

// Type for habitat (item storage)
export type Habitat = NewHabitat & {
  cellId: string
}
