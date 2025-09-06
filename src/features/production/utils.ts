export const generateProductionKey = (cellId: string, name: string): string => {
  return `${cellId}/${name}`
}

export const parseProductionKey = (
  key: string,
): { cellId: string; name: string } => {
  const [cellId, name] = key.split("/")
  return { cellId, name }
}
