import type {
  AlgorithmDefinition,
  AlgorithmExecutionInput,
  AlgorithmMetrics,
  AlgorithmStep,
} from "@/types/algorithm"
import {
  buildPath,
  cloneMetrics,
  createEdgeId,
  getNeighbors,
  learningGraph,
} from "@/config/algorithms/shared"

function createBfsSteps({ graph = learningGraph, targetNodeId = graph.defaultTargetNodeId }: AlgorithmExecutionInput): AlgorithmStep[] {
  const steps: AlgorithmStep[] = []
  const queue = [graph.startNodeId]
  const visited = new Set<string>([graph.startNodeId])
  const previous: Record<string, string | undefined> = { [graph.startNodeId]: undefined }
  const metrics: AlgorithmMetrics = { visited: 1, queueSize: 1, frontierSize: 1 }

  steps.push({
    message: `Breadth-first search starts by enqueueing ${graph.startNodeId}.`,
    simpleExplanation: "BFS explores level by level using a queue.",
    actionLabel: "enqueue start",
    pseudocodeLine: 1,
    graphState: {
      frontierNodeIds: [...queue],
      visitedNodeIds: [...visited],
      queue: [...queue],
    },
    metrics: cloneMetrics(metrics),
  })

  while (queue.length > 0) {
    const currentNodeId = queue.shift() as string
    metrics.queueSize = queue.length
    metrics.frontierSize = queue.length

    steps.push({
      message: `Dequeue ${currentNodeId} and inspect it.`,
      simpleExplanation: "Take the oldest node out of the queue first.",
      actionLabel: "visit node",
      pseudocodeLine: 2,
      graphState: {
        activeNodeIds: [currentNodeId],
        frontierNodeIds: [...queue],
        visitedNodeIds: [...visited],
        queue: [...queue],
        currentNodeId,
      },
      metrics: cloneMetrics(metrics),
    })

    if (currentNodeId === targetNodeId) {
      const path = buildPath(previous, targetNodeId)

      steps.push({
        message: `${targetNodeId} is the target node, so BFS stops here.`,
        simpleExplanation: "The shortest path in an unweighted graph has been found.",
        actionLabel: "found target",
        pseudocodeLine: 3,
        graphState: {
          activeNodeIds: [currentNodeId],
          foundNodeIds: [targetNodeId],
          visitedNodeIds: [...visited],
          queue: [...queue],
          pathNodeIds: path.nodeIds,
          pathEdgeIds: path.edgeIds,
          currentNodeId,
        },
        metrics: cloneMetrics(metrics),
      })

      return steps
    }

    const neighbors = getNeighbors(graph, currentNodeId)

    for (const neighbor of neighbors) {
      if (visited.has(neighbor.nodeId)) {
        continue
      }

      visited.add(neighbor.nodeId)
      previous[neighbor.nodeId] = currentNodeId
      queue.push(neighbor.nodeId)
      metrics.visited = visited.size
      metrics.queueSize = queue.length
      metrics.frontierSize = queue.length

      steps.push({
        message: `Discover ${neighbor.nodeId} from ${currentNodeId} and enqueue it.`,
        simpleExplanation: "New neighbors join the back of the queue for later exploration.",
        actionLabel: "enqueue neighbor",
        pseudocodeLine: 4,
        graphState: {
          activeNodeIds: [currentNodeId, neighbor.nodeId],
          activeEdgeIds: [neighbor.edgeId],
          frontierNodeIds: [...queue],
          visitedNodeIds: [...visited],
          queue: [...queue],
          currentNodeId,
        },
        metrics: cloneMetrics(metrics),
      })
    }
  }

  steps.push({
    message: `${targetNodeId} was not reached before the queue emptied.`,
    simpleExplanation: "All reachable nodes were explored, but the target never appeared.",
    actionLabel: "finish without match",
    pseudocodeLine: 5,
    graphState: {
      visitedNodeIds: [...visited],
      queue: [],
    },
    metrics: cloneMetrics(metrics),
  })

  return steps
}

function createDfsSteps({ graph = learningGraph, targetNodeId = graph.defaultTargetNodeId }: AlgorithmExecutionInput): AlgorithmStep[] {
  const steps: AlgorithmStep[] = []
  const stack = [graph.startNodeId]
  const seen = new Set<string>([graph.startNodeId])
  const visited = new Set<string>()
  const previous: Record<string, string | undefined> = { [graph.startNodeId]: undefined }
  const metrics: AlgorithmMetrics = { visited: 0, stackSize: 1, frontierSize: 1 }

  steps.push({
    message: `Depth-first search starts by pushing ${graph.startNodeId} onto the stack.`,
    simpleExplanation: "DFS dives down one path at a time using a stack.",
    actionLabel: "push start",
    pseudocodeLine: 1,
    graphState: {
      frontierNodeIds: [...stack],
      stack: [...stack],
    },
    metrics: cloneMetrics(metrics),
  })

  while (stack.length > 0) {
    const currentNodeId = stack.pop() as string
    visited.add(currentNodeId)
    metrics.visited = visited.size
    metrics.stackSize = stack.length
    metrics.frontierSize = stack.length

    steps.push({
      message: `Pop ${currentNodeId} from the stack and inspect it.`,
      simpleExplanation: "DFS always continues with the newest pushed node.",
      actionLabel: "visit node",
      pseudocodeLine: 2,
      graphState: {
        activeNodeIds: [currentNodeId],
        visitedNodeIds: [...visited],
        frontierNodeIds: [...stack],
        stack: [...stack],
        currentNodeId,
      },
      metrics: cloneMetrics(metrics),
    })

    if (currentNodeId === targetNodeId) {
      const path = buildPath(previous, targetNodeId)

      steps.push({
        message: `${targetNodeId} is the target node, so DFS stops here.`,
        simpleExplanation: "This path happened to reach the target before the others.",
        actionLabel: "found target",
        pseudocodeLine: 3,
        graphState: {
          activeNodeIds: [currentNodeId],
          foundNodeIds: [targetNodeId],
          visitedNodeIds: [...visited],
          frontierNodeIds: [...stack],
          stack: [...stack],
          pathNodeIds: path.nodeIds,
          pathEdgeIds: path.edgeIds,
          currentNodeId,
        },
        metrics: cloneMetrics(metrics),
      })

      return steps
    }

    const neighbors = getNeighbors(graph, currentNodeId).reverse()

    for (const neighbor of neighbors) {
      if (seen.has(neighbor.nodeId)) {
        continue
      }

      seen.add(neighbor.nodeId)
      previous[neighbor.nodeId] = currentNodeId
      stack.push(neighbor.nodeId)
      metrics.stackSize = stack.length
      metrics.frontierSize = stack.length

      steps.push({
        message: `Push ${neighbor.nodeId} onto the stack from ${currentNodeId}.`,
        simpleExplanation: "This neighbor becomes a future deep branch to explore.",
        actionLabel: "push neighbor",
        pseudocodeLine: 4,
        graphState: {
          activeNodeIds: [currentNodeId, neighbor.nodeId],
          activeEdgeIds: [neighbor.edgeId],
          visitedNodeIds: [...visited],
          frontierNodeIds: [...stack],
          stack: [...stack],
          currentNodeId,
        },
        metrics: cloneMetrics(metrics),
      })
    }
  }

  steps.push({
    message: `${targetNodeId} was not reached before the stack emptied.`,
    simpleExplanation: "DFS explored every reachable path without hitting the target.",
    actionLabel: "finish without match",
    pseudocodeLine: 5,
    graphState: {
      visitedNodeIds: [...visited],
      stack: [],
    },
    metrics: cloneMetrics(metrics),
  })

  return steps
}

function createDijkstraSteps({ graph = learningGraph, targetNodeId = graph.defaultTargetNodeId }: AlgorithmExecutionInput): AlgorithmStep[] {
  const distances = Object.fromEntries(graph.nodes.map((node) => [node.id, Number.POSITIVE_INFINITY])) as Record<string, number>
  const previous: Record<string, string | undefined> = {}
  const unvisited = new Set(graph.nodes.map((node) => node.id))
  const finalized = new Set<string>()
  const steps: AlgorithmStep[] = []
  const metrics: AlgorithmMetrics = { visited: 0, frontierSize: 0, relaxations: 0, pathCost: 0 }

  distances[graph.startNodeId] = 0

  steps.push({
    message: `Initialize ${graph.startNodeId} with distance 0 and every other node with infinity.`,
    simpleExplanation: "At the start, only the source has a known distance.",
    actionLabel: "initialize distances",
    pseudocodeLine: 1,
    graphState: {
      frontierNodeIds: [graph.startNodeId],
      distances: { ...distances },
    },
    metrics: cloneMetrics({ ...metrics, frontierSize: 1 }),
  })

  while (unvisited.size > 0) {
    const currentNodeId = [...unvisited].reduce<string | null>((bestNodeId, candidateNodeId) => {
      if (bestNodeId === null) {
        return candidateNodeId
      }

      return distances[candidateNodeId] < distances[bestNodeId] ? candidateNodeId : bestNodeId
    }, null)

    if (!currentNodeId || !Number.isFinite(distances[currentNodeId])) {
      break
    }

    unvisited.delete(currentNodeId)
    finalized.add(currentNodeId)
    metrics.visited = finalized.size
    metrics.frontierSize = [...unvisited].filter((nodeId) => Number.isFinite(distances[nodeId])).length
    metrics.pathCost = distances[currentNodeId]

    steps.push({
      message: `Select ${currentNodeId} because it has the smallest tentative distance (${distances[currentNodeId]}).`,
      simpleExplanation: "This node is the safest one to finalize next.",
      actionLabel: "finalize node",
      pseudocodeLine: 2,
      graphState: {
        activeNodeIds: [currentNodeId],
        visitedNodeIds: [...finalized],
        frontierNodeIds: [...unvisited],
        distances: { ...distances },
        currentNodeId,
      },
      metrics: cloneMetrics(metrics),
    })

    if (currentNodeId === targetNodeId) {
      const path = buildPath(previous, targetNodeId)

      steps.push({
        message: `${targetNodeId} has the shortest finalized distance, so Dijkstra can stop.`,
        simpleExplanation: "The cheapest path to the target is now guaranteed.",
        actionLabel: "found shortest path",
        pseudocodeLine: 5,
        graphState: {
          foundNodeIds: [targetNodeId],
          visitedNodeIds: [...finalized],
          pathNodeIds: path.nodeIds,
          pathEdgeIds: path.edgeIds,
          distances: { ...distances },
          currentNodeId,
        },
        metrics: cloneMetrics(metrics),
      })

      return steps
    }

    for (const neighbor of getNeighbors(graph, currentNodeId)) {
      if (!unvisited.has(neighbor.nodeId)) {
        continue
      }

      const candidateDistance = distances[currentNodeId] + neighbor.weight

      steps.push({
        message: `Check whether going through ${currentNodeId} improves the distance to ${neighbor.nodeId}.`,
        simpleExplanation: "Try relaxing this edge to see if it offers a cheaper route.",
        actionLabel: "inspect edge",
        pseudocodeLine: 3,
        graphState: {
          activeNodeIds: [currentNodeId, neighbor.nodeId],
          activeEdgeIds: [neighbor.edgeId],
          visitedNodeIds: [...finalized],
          frontierNodeIds: [...unvisited],
          distances: { ...distances },
          currentNodeId,
        },
        metrics: cloneMetrics(metrics),
      })

      if (candidateDistance < distances[neighbor.nodeId]) {
        distances[neighbor.nodeId] = candidateDistance
        previous[neighbor.nodeId] = currentNodeId
        metrics.relaxations = (metrics.relaxations ?? 0) + 1
        metrics.frontierSize = [...unvisited].filter((nodeId) => Number.isFinite(distances[nodeId])).length

        steps.push({
          message: `Update ${neighbor.nodeId} to distance ${candidateDistance} via ${currentNodeId}.`,
          simpleExplanation: "A shorter path was found, so remember this better route.",
          actionLabel: "relax edge",
          pseudocodeLine: 4,
          graphState: {
            activeNodeIds: [currentNodeId, neighbor.nodeId],
            activeEdgeIds: [neighbor.edgeId],
            visitedNodeIds: [...finalized],
            frontierNodeIds: [...unvisited],
            distances: { ...distances },
            currentNodeId,
          },
          metrics: cloneMetrics(metrics),
        })
      }
    }
  }

  steps.push({
    message: `${targetNodeId} could not be finalized from the source node.`,
    simpleExplanation: "No complete path to the target was discovered.",
    actionLabel: "finish without path",
    pseudocodeLine: 5,
    graphState: {
      visitedNodeIds: [...finalized],
      distances: { ...distances },
    },
    metrics: cloneMetrics(metrics),
  })

  return steps
}
export const graphAlgorithms: AlgorithmDefinition[] = [
  {
    id: "bfs",
    name: "Breadth-First Search",
    category: "graphs",
    difficulty: "beginner",
    datasetKind: "graph",
    visualMode: "graph",
    description: "Explores graph layers in queue order and finds shortest paths in unweighted graphs.",
    concepts: ["queue", "level-order exploration", "unweighted shortest path"],
    pseudocode: [
      "enqueue the start node",
      "dequeue the front node",
      "return if it is the target",
      "enqueue each undiscovered neighbor",
      "repeat until the queue is empty",
    ],
    complexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)", space: "O(V)" },
    notes: {
      intuition: "BFS moves outward in waves, so the first time it reaches a node is the shortest unweighted route.",
      tradeoffs: [
        "Excellent for shortest paths in unweighted graphs.",
        "Queue can grow large on wide graphs.",
        "Visits neighbors in strict breadth order.",
      ],
      interviewTips: [
        "Mention parent tracking if you need to reconstruct the path.",
        "Explain why the first visit to a node is enough in an unweighted graph.",
      ],
      whenToUse: "Use for reachability, level-order traversal, and shortest paths when every edge has equal cost.",
    },
    targetType: "node",
    graph: learningGraph,
    createSteps: createBfsSteps,
  },
  {
    id: "dfs",
    name: "Depth-First Search",
    category: "graphs",
    difficulty: "intermediate",
    datasetKind: "graph",
    visualMode: "graph",
    description: "Follows one branch as deeply as possible before backtracking to try the next branch.",
    concepts: ["stack", "backtracking", "deep traversal"],
    pseudocode: [
      "push the start node",
      "pop the top node and inspect it",
      "return if it is the target",
      "push each undiscovered neighbor",
      "repeat until the stack is empty",
    ],
    complexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)", space: "O(V)" },
    notes: {
      intuition: "DFS commits to one path until it cannot go any deeper, then backtracks.",
      tradeoffs: [
        "Good for path existence and topological-style reasoning.",
        "Does not guarantee the shortest path.",
        "Can be implemented recursively or iteratively.",
      ],
      interviewTips: [
        "Clarify whether you mark nodes when pushing or when popping.",
        "Use DFS to discuss connected components and cycle detection.",
      ],
      whenToUse: "Use when you want deep traversal behavior, backtracking, or graph structure analysis.",
    },
    targetType: "node",
    graph: learningGraph,
    createSteps: createDfsSteps,
  },
  {
    id: "dijkstra",
    name: "Dijkstra's Algorithm",
    category: "graphs",
    difficulty: "advanced",
    datasetKind: "graph",
    visualMode: "graph",
    description: "Finds the shortest path from the source to every reachable node when all edge weights are non-negative.",
    concepts: ["weighted graph", "relaxation", "shortest path", "greedy choice"],
    pseudocode: [
      "initialize source distance to 0 and others to infinity",
      "pick the unvisited node with the smallest tentative distance",
      "inspect each outgoing edge from that node",
      "relax the edge if it yields a shorter path",
      "stop once the target is finalized or no nodes remain reachable",
    ],
    complexity: { best: "O((V + E) log V)", average: "O((V + E) log V)", worst: "O((V + E) log V)", space: "O(V)" },
    notes: {
      intuition: "Dijkstra greedily finalizes the nearest unfinished node because non-negative weights make that choice safe.",
      tradeoffs: [
        "Great for non-negative weighted shortest paths.",
        "Not valid when negative-weight edges exist.",
        "Priority queues improve performance on larger graphs.",
      ],
      interviewTips: [
        "Explain why finalized nodes never need to be revisited with non-negative weights.",
        "Be ready to contrast Dijkstra with BFS and Bellman-Ford.",
      ],
      whenToUse: "Use for shortest-path problems on weighted graphs with non-negative edge costs.",
    },
    targetType: "node",
    graph: learningGraph,
    createSteps: createDijkstraSteps,
  },
]

export { learningGraph }
