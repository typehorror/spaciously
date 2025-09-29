export const generateProductionKey = (cellId: string, name: string): string => {
  return `${cellId}/${name}`
}

export const parseProductionKey = (
  key: string,
): { cellId: string; name: string } => {
  const [cellId, name] = key.split("/")

  if (cellId && name) {
    return { cellId, name }
  }

  throw new Error(`Invalid production key: ${key}`)
}
