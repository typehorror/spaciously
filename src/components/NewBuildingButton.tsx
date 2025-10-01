import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { PlusIcon } from "lucide-react"
import {
  addBuilding,
  selectAllBuildings,
} from "@/features/building/buildingSlice"
import { type ProductRecipe } from "@/features/production/types"
import { useState } from "react"
import { addTask } from "@/features/task/taskSlice"

interface Props {
  cellId: string
  slotIndex: number
}

export const NewBuildingButton: React.FC<Props> = ({ cellId, slotIndex }) => {
  const available = useAppSelector(state => selectAllBuildings(state))
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false)

  const renderRecipeInputs = (recipe: ProductRecipe) => {
    return recipe.inputs.map(input => (
      <div key={input.product} className="flex items-center space-x-2">
        <img
          src={`/assets/items/${input.product}.png`}
          alt={input.product}
          className="w-6 h-6"
        />
        <span>{input.quantity}</span>
      </div>
    ))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex justify-center items-center flex-col gap-1 w-full h-32 rounded-md border-white/20 border hover:border-solid hover:border-white/40 border-dashed text-gray-500 hover:text-gray-200 hover:bg-white/5 transition">
        <PlusIcon size={24} />
        <span> Build</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Available Constructions</DialogTitle>
          <DialogDescription></DialogDescription>
          <div className="space-y-3">
            <div>
              <div className="mt-2 grid gap-2">
                {available.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    No Constructions available
                  </div>
                )}
                {available.map(building => (
                  <div
                    key={building.id}
                    className="p-3 border cursor-pointer hover:bg-gray-400/10 rounded-md hover:border-gray-500 flex justify-between items-center"
                    role="button"
                    onClick={() => {
                      dispatch(
                        addTask({
                          id: `${cellId}:BUILDING:${slotIndex.toString()}`,
                          duration: building.recipe.buildTime,
                          energyUsage: building.recipe.energy,
                          action: addBuilding({
                            cellId,
                            slotIndex,
                            building: building,
                          }),
                        }),
                      )
                      setOpen(false)
                    }}
                  >
                    <div>
                      <div className="font-medium text-white">
                        {building.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {building.description}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {renderRecipeInputs(building.recipe)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
