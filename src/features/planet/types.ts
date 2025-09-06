export type NewPlanet = {
  name: string
}

export type Planet = {
  id: number
} & NewPlanet
