// Type for warehouse (item storage)
export type NewWarehouse = {
  content: WarehouseContent
  capacity: number
}

// Type for warehouse (item storage)
export type Warehouse = NewWarehouse & {
  cellId: string
}

export type WarehouseContent = Partial<Record<string, number>>
