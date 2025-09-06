// Type for warehouse (item storage)
export type WarehouseContent = {
  cellId: string
  id: string
  content: Partial<Record<string, number>>
  capacity: number
}
