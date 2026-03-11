"use client"

import { memo, useMemo, type CSSProperties } from "react"
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  BaseEdge,
  EdgeLabelRenderer,
  Handle,
  Position,
  getStraightPath,
  type EdgeProps,
  type NodeProps,
} from "@xyflow/react"
import type { AlgorithmStep, GraphDefinition } from "@/types/algorithm"
import type {
  AlgorithmGraphEdgeTone,
  AlgorithmGraphFlowEdge,
  AlgorithmGraphFlowNode,
  AlgorithmGraphNodeTone,
} from "@/types/algorithm-visualizer"

const graphCanvasWidth = 1000
const graphCanvasHeight = 625
const weightLabelOffset = 18

const hiddenHandleStyle: CSSProperties = {
  opacity: 0,
  width: 1,
  height: 1,
  border: 0,
  background: "transparent",
  pointerEvents: "none",
}

const sourceHandleIds = {
  top: "source-top",
  right: "source-right",
  bottom: "source-bottom",
  left: "source-left",
} as const

const targetHandleIds = {
  top: "target-top",
  right: "target-right",
  bottom: "target-bottom",
  left: "target-left",
} as const

const nodeToneStyles: Record<AlgorithmGraphNodeTone, CSSProperties> = {
  default: {
    backgroundColor: "#f5efe5",
    borderColor: "#d6cab9",
    color: "#4f4538",
  },
  frontier: {
    backgroundColor: "#efe4d2",
    borderColor: "#d7c29d",
    color: "#6e5430",
  },
  visited: {
    backgroundColor: "#e2eadf",
    borderColor: "#bfceb8",
    color: "#4b6245",
  },
  active: {
    backgroundColor: "#ead9c0",
    borderColor: "#ccb28a",
    color: "#5a4222",
  },
  path: {
    backgroundColor: "#d9e7d4",
    borderColor: "#a7c096",
    color: "#35532d",
  },
  found: {
    backgroundColor: "#cfe3c7",
    borderColor: "#91b07d",
    color: "#23411c",
  },
}

const edgeToneStyles: Record<AlgorithmGraphEdgeTone, CSSProperties> = {
  default: {
    stroke: "#c8bcaa",
    strokeWidth: 1.15,
  },
  active: {
    stroke: "#8a6b3f",
    strokeWidth: 1.55,
  },
  path: {
    stroke: "#6f9061",
    strokeWidth: 1.7,
  },
}

function getNodeTone(nodeId: string, step: AlgorithmStep): AlgorithmGraphNodeTone {
  const graphState = step.graphState

  if (graphState?.foundNodeIds?.includes(nodeId)) {
    return "found"
  }
  if (graphState?.pathNodeIds?.includes(nodeId)) {
    return "path"
  }
  if (graphState?.activeNodeIds?.includes(nodeId)) {
    return "active"
  }
  if (graphState?.visitedNodeIds?.includes(nodeId)) {
    return "visited"
  }
  if (graphState?.frontierNodeIds?.includes(nodeId)) {
    return "frontier"
  }

  return "default"
}

function getEdgeTone(edgeId: string, step: AlgorithmStep): AlgorithmGraphEdgeTone {
  const graphState = step.graphState

  if (graphState?.pathEdgeIds?.includes(edgeId)) {
    return "path"
  }
  if (graphState?.activeEdgeIds?.includes(edgeId)) {
    return "active"
  }

  return "default"
}

function getDistanceLabel(distanceValue: number | undefined) {
  if (typeof distanceValue !== "number") {
    return undefined
  }

  return Number.isFinite(distanceValue) ? String(distanceValue) : "∞"
}

function getHandleIds(sourceX: number, sourceY: number, targetX: number, targetY: number) {
  const deltaX = targetX - sourceX
  const deltaY = targetY - sourceY

  if (Math.abs(deltaX) >= Math.abs(deltaY)) {
    return deltaX >= 0
      ? { sourceHandle: sourceHandleIds.right, targetHandle: targetHandleIds.left }
      : { sourceHandle: sourceHandleIds.left, targetHandle: targetHandleIds.right }
  }

  return deltaY >= 0
    ? { sourceHandle: sourceHandleIds.bottom, targetHandle: targetHandleIds.top }
    : { sourceHandle: sourceHandleIds.top, targetHandle: targetHandleIds.bottom }
}

function getLabelPosition(sourceX: number, sourceY: number, targetX: number, targetY: number) {
  const midpointX = (sourceX + targetX) / 2
  const midpointY = (sourceY + targetY) / 2
  const deltaX = targetX - sourceX
  const deltaY = targetY - sourceY
  const length = Math.hypot(deltaX, deltaY) || 1
  const normalX = -deltaY / length
  const normalY = deltaX / length
  const directionMultiplier = normalY < 0 ? -1 : 1

  return {
    x: midpointX + normalX * weightLabelOffset * directionMultiplier,
    y: midpointY + normalY * weightLabelOffset * directionMultiplier,
  }
}

const AlgorithmGraphNodeComponent = memo(function AlgorithmGraphNodeComponent({
  data,
}: NodeProps<AlgorithmGraphFlowNode>) {
  return (
    <div className="alg-flow-node nodrag">
      <span className="swift-chip alg-flow-node-tag" style={nodeToneStyles[data.tone]}>
        {data.label}
      </span>
      {data.distanceLabel ? (
        <span className="swift-chip alg-flow-cost-tag normal-case tracking-normal font-medium">
          {data.distanceLabel}
        </span>
      ) : null}

      <Handle id={sourceHandleIds.top} type="source" position={Position.Top} style={hiddenHandleStyle} isConnectable={false} />
      <Handle id={sourceHandleIds.right} type="source" position={Position.Right} style={hiddenHandleStyle} isConnectable={false} />
      <Handle id={sourceHandleIds.bottom} type="source" position={Position.Bottom} style={hiddenHandleStyle} isConnectable={false} />
      <Handle id={sourceHandleIds.left} type="source" position={Position.Left} style={hiddenHandleStyle} isConnectable={false} />

      <Handle id={targetHandleIds.top} type="target" position={Position.Top} style={hiddenHandleStyle} isConnectable={false} />
      <Handle id={targetHandleIds.right} type="target" position={Position.Right} style={hiddenHandleStyle} isConnectable={false} />
      <Handle id={targetHandleIds.bottom} type="target" position={Position.Bottom} style={hiddenHandleStyle} isConnectable={false} />
      <Handle id={targetHandleIds.left} type="target" position={Position.Left} style={hiddenHandleStyle} isConnectable={false} />
    </div>
  )
})

const AlgorithmGraphEdgeComponent = memo(function AlgorithmGraphEdgeComponent({
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: EdgeProps<AlgorithmGraphFlowEdge>) {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  })

  const edgeStyle = edgeToneStyles[data?.tone ?? "default"]
  const labelPosition = getLabelPosition(sourceX, sourceY, targetX, targetY)

  return (
    <>
      <BaseEdge path={edgePath} style={edgeStyle} interactionWidth={18} />
      {data?.weightLabel ? (
        <EdgeLabelRenderer>
          <div
            className="swift-chip alg-flow-edge-label normal-case tracking-normal font-medium nodrag nopan"
            style={{
              transform: `translate(-50%, -50%) translate(${labelPosition.x}px, ${labelPosition.y}px)`,
            }}
          >
            {data.weightLabel}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  )
})

const nodeTypes = {
  algorithmGraphNode: AlgorithmGraphNodeComponent,
}

const edgeTypes = {
  algorithmGraphEdge: AlgorithmGraphEdgeComponent,
}

function createFlowNodes(graph: GraphDefinition, step: AlgorithmStep): AlgorithmGraphFlowNode[] {
  return graph.nodes.map((node) => ({
    id: node.id,
    type: "algorithmGraphNode",
    position: {
      x: (node.x / 100) * graphCanvasWidth,
      y: (node.y / 100) * graphCanvasHeight,
    },
    data: {
      label: node.label,
      tone: getNodeTone(node.id, step),
      distanceLabel: getDistanceLabel(step.graphState?.distances?.[node.id]),
    },
    draggable: false,
    selectable: false,
    focusable: false,
  }))
}

function createFlowEdges(graph: GraphDefinition, step: AlgorithmStep): AlgorithmGraphFlowEdge[] {
  const graphNodeById = Object.fromEntries(graph.nodes.map((node) => [node.id, node]))

  return graph.edges.flatMap((edge) => {
    const sourceNode = graphNodeById[edge.from]
    const targetNode = graphNodeById[edge.to]

    if (!sourceNode || !targetNode) {
      return []
    }

    const { sourceHandle, targetHandle } = getHandleIds(sourceNode.x, sourceNode.y, targetNode.x, targetNode.y)

    return [
      {
        id: edge.id,
        source: edge.from,
        target: edge.to,
        sourceHandle,
        targetHandle,
        type: "algorithmGraphEdge",
        data: {
          tone: getEdgeTone(edge.id, step),
          weightLabel: typeof edge.weight === "number" ? String(edge.weight) : undefined,
        },
        selectable: false,
        focusable: false,
        zIndex: edgeToneStyles[getEdgeTone(edge.id, step)].strokeWidth as number,
      },
    ]
  })
}

export default function AlgorithmGraphFlow({
  graph,
  step,
}: {
  graph: GraphDefinition
  step: AlgorithmStep
}) {
  const nodes = useMemo(() => createFlowNodes(graph, step), [graph, step])
  const edges = useMemo(() => createFlowEdges(graph, step), [graph, step])

  return (
    <div className="alg-flow h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.22 }}
        nodeOrigin={[0.5, 0.5]}
        minZoom={0.8}
        maxZoom={1.25}
        nodesDraggable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        edgesReconnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        panOnScroll={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        elevateNodesOnSelect={false}
        elevateEdgesOnSelect={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          id="alg-graph-background"
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.2}
          color="#e7ded0"
        />
      </ReactFlow>
    </div>
  )
}
