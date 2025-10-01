import { type ProductRecipe } from "../production/types"

export interface Research {
  id: string
  name: string
  description: string
  researched: boolean
  prerequisites: string[] // array of research ids
  recipe: ProductRecipe
}
