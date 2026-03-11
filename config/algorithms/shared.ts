import type { AlgorithmMetrics, GraphDefinition } from "@/types/algorithm"

export const sortingDataset = [8, 3, 5, 1, 9, 6, 2, 7]
export const searchDataset = [14, 3, 28, 9, 41, 18, 7, 25]
export const binarySearchDataset = [2, 5, 8, 12, 16, 23, 38, 56, 72]

export const learningGraph: GraphDefinition = {
  startNodeId: "A",
  defaultTargetNodeId: "G",
  directed: false,
  nodes: [
    { id: "A", label: "A", x: 10, y: 48 },
    { id: "B", label: "B", x: 26, y: 22 },
    { id: "C", label: "C", x: 28, y: 74 },
    { id: "D", label: "D", x: 48, y: 48 },
    { id: "E", label: "E", x: 66, y: 22 },
    { id: "F", label: "F", x: 68, y: 74 },
    { id: "G", label: "G", x: 88, y: 48 },
  ],
  edges: [
    { id: "A-B", from: "A", to: "B", weight: 4 },
    { id: "A-C", from: "A", to: "C", weight: 2 },
    { id: "B-D", from: "B", to: "D", weight: 3 },
    { id: "C-D", from: "C", to: "D", weight: 1 },
    { id: "C-F", from: "C", to: "F", weight: 7 },
    { id: "D-E", from: "D", to: "E", weight: 2 },
    { id: "D-F", from: "D", to: "F", weight: 5 },
    { id: "E-G", from: "E", to: "G", weight: 3 },
    { id: "F-G", from: "F", to: "G", weight: 1 },
  ],
}

export function cloneMetrics(metrics: AlgorithmMetrics): AlgorithmMetrics {
  return { ...metrics }
}

export function rangeIndices(start: number, end: number) {
  return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index)
}

export function suffixIndices(totalLength: number, suffixLength: number) {
  return Array.from({ length: suffixLength }, (_, index) => totalLength - suffixLength + index)
}

export function prefixIndices(prefixLength: number) {
  return Array.from({ length: prefixLength }, (_, index) => index)
}

export function buildPath(previous: Record<string, string | undefined>, targetNodeId: string) {
  const nodeIds: string[] = []
  let currentNodeId: string | undefined = targetNodeId

  while (currentNodeId) {
    nodeIds.unshift(currentNodeId)
    currentNodeId = previous[currentNodeId]
  }

  const edgeIds = nodeIds.slice(1).map((nodeId, index) => createEdgeId(nodeIds[index], nodeId))

  return { nodeIds, edgeIds }
}

export function createEdgeId(nodeA: string, nodeB: string) {
  return [nodeA, nodeB].sort().join("-")
}

export function getNeighbors(graph: GraphDefinition, nodeId: string) {
  return graph.edges
    .flatMap((edge) => {
      if (edge.from === nodeId) {
        return [{ nodeId: edge.to, edgeId: edge.id, weight: edge.weight ?? 1 }]
      }

      if (!graph.directed && edge.to === nodeId) {
        return [{ nodeId: edge.from, edgeId: edge.id, weight: edge.weight ?? 1 }]
      }

      return []
    })
    .sort((leftNeighbor, rightNeighbor) => leftNeighbor.nodeId.localeCompare(rightNeighbor.nodeId))
}
