export type Research = {
  id: string
  name: string
  description: string
  cost: number
  researched: boolean
  prerequisites: string[] // array of research ids
  duration: number // time in milliseconds to complete the research
}
