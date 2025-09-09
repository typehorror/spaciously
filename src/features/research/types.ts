export type Research = {
  id: string
  name: string
  description: string
  cost: number
  researched: boolean
  prerequisites: string[] // array of research ids
}
