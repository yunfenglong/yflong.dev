import type {
  AlgorithmDefinition,
  AlgorithmExecutionInput,
  AlgorithmMetrics,
  AlgorithmStep,
  GraphDefinition,
} from "@/types/algorithm"

const sortingDataset = [8, 3, 5, 1, 9, 6, 2, 7]
const searchDataset = [14, 3, 28, 9, 41, 18, 7, 25]
const binarySearchDataset = [2, 5, 8, 12, 16, 23, 38, 56, 72]

const learningGraph: GraphDefinition = {
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

function cloneMetrics(metrics: AlgorithmMetrics): AlgorithmMetrics {
  return { ...metrics }
}

function rangeIndices(start: number, end: number) {
  return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index)
}

function suffixIndices(totalLength: number, suffixLength: number) {
  return Array.from({ length: suffixLength }, (_, index) => totalLength - suffixLength + index)
}

function prefixIndices(prefixLength: number) {
  return Array.from({ length: prefixLength }, (_, index) => index)
}

function buildPath(previous: Record<string, string | undefined>, targetNodeId: string) {
  const nodeIds: string[] = []
  let currentNodeId: string | undefined = targetNodeId

  while (currentNodeId) {
    nodeIds.unshift(currentNodeId)
    currentNodeId = previous[currentNodeId]
  }

  const edgeIds = nodeIds.slice(1).map((nodeId, index) => createEdgeId(nodeIds[index], nodeId))

  return { nodeIds, edgeIds }
}

function createEdgeId(nodeA: string, nodeB: string) {
  return [nodeA, nodeB].sort().join("-")
}

function getNeighbors(graph: GraphDefinition, nodeId: string) {
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

function createBubbleSortSteps({ values: initialValues }: AlgorithmExecutionInput): AlgorithmStep[] {
  const values = [...initialValues]
  const metrics: AlgorithmMetrics = { comparisons: 0, swaps: 0, passes: 0, sortedCount: 0 }
  const steps: AlgorithmStep[] = [
    {
      values: [...values],
      message: "Bubble sort begins by scanning adjacent pairs from left to right.",
      simpleExplanation: "Look at two neighboring numbers at a time.",
      actionLabel: "start scan",
      pseudocodeLine: 1,
      metrics: cloneMetrics(metrics),
    },
  ]

  for (let passIndex = 0; passIndex < values.length - 1; passIndex += 1) {
    metrics.passes = passIndex + 1
    let swappedInPass = false

    for (let compareIndex = 0; compareIndex < values.length - passIndex - 1; compareIndex += 1) {
      const nextIndex = compareIndex + 1
      metrics.comparisons = (metrics.comparisons ?? 0) + 1

      steps.push({
        values: [...values],
        comparedIndices: [compareIndex, nextIndex],
        sortedIndices: suffixIndices(values.length, passIndex),
        message: `Compare ${values[compareIndex]} and ${values[nextIndex]}.`,
        simpleExplanation: "Check whether this pair is already in the right order.",
        actionLabel: "compare pair",
        pseudocodeLine: 2,
        metrics: cloneMetrics(metrics),
      })

      if (values[compareIndex] > values[nextIndex]) {
        ;[values[compareIndex], values[nextIndex]] = [values[nextIndex], values[compareIndex]]
        swappedInPass = true
        metrics.swaps = (metrics.swaps ?? 0) + 1

        steps.push({
          values: [...values],
          activeIndices: [compareIndex, nextIndex],
          sortedIndices: suffixIndices(values.length, passIndex),
          message: `Swap ${values[nextIndex]} with ${values[compareIndex]} so the larger value moves right.`,
          simpleExplanation: "The bigger number bubbles one step toward the end.",
          actionLabel: "swap pair",
          pseudocodeLine: 3,
          metrics: cloneMetrics(metrics),
        })
      }
    }

    metrics.sortedCount = passIndex + 1

    steps.push({
      values: [...values],
      sortedIndices: suffixIndices(values.length, passIndex + 1),
      message: `Pass ${passIndex + 1} finishes and locks the rightmost remaining value.`,
      simpleExplanation: "One more number is guaranteed to be in its final spot.",
      actionLabel: "lock sorted value",
      pseudocodeLine: 4,
      metrics: cloneMetrics(metrics),
    })

    if (!swappedInPass) {
      metrics.sortedCount = values.length

      steps.push({
        values: [...values],
        sortedIndices: prefixIndices(values.length),
        message: "No swaps happened in this pass, so the array is already sorted.",
        simpleExplanation: "Nothing changed, which means the job is done early.",
        actionLabel: "finish early",
        pseudocodeLine: 4,
        metrics: cloneMetrics(metrics),
      })

      return steps
    }
  }

  metrics.sortedCount = values.length

  steps.push({
    values: [...values],
    sortedIndices: prefixIndices(values.length),
    message: "Bubble sort is complete.",
    simpleExplanation: "Every number is now in ascending order.",
    actionLabel: "finish sort",
    pseudocodeLine: 4,
    metrics: cloneMetrics(metrics),
  })

  return steps
}

function createSelectionSortSteps({ values: initialValues }: AlgorithmExecutionInput): AlgorithmStep[] {
  const values = [...initialValues]
  const metrics: AlgorithmMetrics = { comparisons: 0, swaps: 0, sortedCount: 0 }
  const steps: AlgorithmStep[] = [
    {
      values: [...values],
      message: "Selection sort grows a sorted prefix by selecting the minimum remaining value.",
      simpleExplanation: "Pick the smallest unsorted number and place it next.",
      actionLabel: "start selection",
      pseudocodeLine: 1,
      metrics: cloneMetrics(metrics),
    },
  ]

  for (let positionIndex = 0; positionIndex < values.length - 1; positionIndex += 1) {
    let smallestIndex = positionIndex

    steps.push({
      values: [...values],
      activeIndices: [positionIndex],
      sortedIndices: prefixIndices(positionIndex),
      message: `Start scanning for the minimum value from index ${positionIndex}.`,
      simpleExplanation: "The next slot in the sorted prefix is ready to be filled.",
      actionLabel: "scan minimum",
      pseudocodeLine: 1,
      metrics: cloneMetrics(metrics),
    })

    for (let scanIndex = positionIndex + 1; scanIndex < values.length; scanIndex += 1) {
      metrics.comparisons = (metrics.comparisons ?? 0) + 1

      steps.push({
        values: [...values],
        comparedIndices: [smallestIndex, scanIndex],
        sortedIndices: prefixIndices(positionIndex),
        message: `Compare current minimum ${values[smallestIndex]} with ${values[scanIndex]}.`,
        simpleExplanation: "Check whether you found an even smaller number.",
        actionLabel: "compare candidate",
        pseudocodeLine: 2,
        metrics: cloneMetrics(metrics),
      })

      if (values[scanIndex] < values[smallestIndex]) {
        smallestIndex = scanIndex

        steps.push({
          values: [...values],
          activeIndices: [smallestIndex],
          sortedIndices: prefixIndices(positionIndex),
          message: `${values[smallestIndex]} becomes the new minimum candidate.`,
          simpleExplanation: "This is the smallest unsorted number seen so far.",
          actionLabel: "update minimum",
          pseudocodeLine: 2,
          metrics: cloneMetrics(metrics),
        })
      }
    }

    if (smallestIndex !== positionIndex) {
      ;[values[positionIndex], values[smallestIndex]] = [values[smallestIndex], values[positionIndex]]
      metrics.swaps = (metrics.swaps ?? 0) + 1

      steps.push({
        values: [...values],
        activeIndices: [positionIndex, smallestIndex],
        sortedIndices: prefixIndices(positionIndex),
        message: `Swap the minimum value into index ${positionIndex}.`,
        simpleExplanation: "Put the smallest unsorted number into the next open slot.",
        actionLabel: "swap minimum",
        pseudocodeLine: 3,
        metrics: cloneMetrics(metrics),
      })
    }

    metrics.sortedCount = positionIndex + 1

    steps.push({
      values: [...values],
      sortedIndices: prefixIndices(positionIndex + 1),
      message: `Index ${positionIndex} is now fixed in sorted order.`,
      simpleExplanation: "The sorted prefix grows by one position.",
      actionLabel: "grow sorted prefix",
      pseudocodeLine: 4,
      metrics: cloneMetrics(metrics),
    })
  }

  metrics.sortedCount = values.length

  steps.push({
    values: [...values],
    sortedIndices: prefixIndices(values.length),
    message: "Selection sort is complete.",
    simpleExplanation: "All positions have been filled with the correct minimum values.",
    actionLabel: "finish sort",
    pseudocodeLine: 4,
    metrics: cloneMetrics(metrics),
  })

  return steps
}

function createInsertionSortSteps({ values: initialValues }: AlgorithmExecutionInput): AlgorithmStep[] {
  const values = [...initialValues]
  const metrics: AlgorithmMetrics = { comparisons: 0, writes: 0, sortedCount: 1 }
  const steps: AlgorithmStep[] = [
    {
      values: [...values],
      sortedIndices: [0],
      message: "Insertion sort starts with a one-item sorted prefix.",
      simpleExplanation: "Treat the first number as already sorted.",
      actionLabel: "start prefix",
      pseudocodeLine: 1,
      metrics: cloneMetrics(metrics),
    },
  ]

  for (let currentIndex = 1; currentIndex < values.length; currentIndex += 1) {
    const currentValue = values[currentIndex]
    let insertIndex = currentIndex

    steps.push({
      values: [...values],
      activeIndices: [currentIndex],
      sortedIndices: prefixIndices(currentIndex),
      message: `Pick up ${currentValue} from index ${currentIndex}.`,
      simpleExplanation: "This value will slide into the sorted prefix.",
      actionLabel: "pick next value",
      pseudocodeLine: 2,
      metrics: { ...cloneMetrics(metrics), currentIndex },
    })

    while (insertIndex > 0 && values[insertIndex - 1] > currentValue) {
      metrics.comparisons = (metrics.comparisons ?? 0) + 1

      steps.push({
        values: [...values],
        comparedIndices: [insertIndex - 1, insertIndex],
        sortedIndices: prefixIndices(currentIndex),
        message: `${values[insertIndex - 1]} is larger than ${currentValue}.`,
        simpleExplanation: "The larger sorted value must move right to make room.",
        actionLabel: "compare for insertion",
        pseudocodeLine: 3,
        metrics: { ...cloneMetrics(metrics), currentIndex: insertIndex - 1 },
      })

      values[insertIndex] = values[insertIndex - 1]
      metrics.writes = (metrics.writes ?? 0) + 1

      steps.push({
        values: [...values],
        activeIndices: [insertIndex - 1, insertIndex],
        sortedIndices: prefixIndices(currentIndex),
        message: `Shift ${values[insertIndex]} one position to the right.`,
        simpleExplanation: "Slide the bigger number over by one slot.",
        actionLabel: "shift right",
        pseudocodeLine: 3,
        metrics: { ...cloneMetrics(metrics), currentIndex: insertIndex },
      })

      insertIndex -= 1
    }

    if (insertIndex > 0) {
      metrics.comparisons = (metrics.comparisons ?? 0) + 1
    }

    values[insertIndex] = currentValue
    metrics.writes = (metrics.writes ?? 0) + 1
    metrics.sortedCount = currentIndex + 1

    steps.push({
      values: [...values],
      activeIndices: [insertIndex],
      sortedIndices: prefixIndices(currentIndex + 1),
      message: `Insert ${currentValue} at index ${insertIndex}.`,
      simpleExplanation: "Drop the value into the gap that was just created.",
      actionLabel: "insert value",
      pseudocodeLine: 4,
      metrics: { ...cloneMetrics(metrics), currentIndex: insertIndex },
    })
  }

  steps.push({
    values: [...values],
    sortedIndices: prefixIndices(values.length),
    message: "Insertion sort is complete.",
    simpleExplanation: "The sorted prefix now spans the entire array.",
    actionLabel: "finish sort",
    pseudocodeLine: 4,
    metrics: cloneMetrics(metrics),
  })

  return steps
}

function createMergeSortSteps({ values: initialValues }: AlgorithmExecutionInput): AlgorithmStep[] {
  const values = [...initialValues]
  const metrics: AlgorithmMetrics = { comparisons: 0, writes: 0 }
  const steps: AlgorithmStep[] = [
    {
      values: [...values],
      message: "Merge sort repeatedly splits the array into smaller ranges before merging them back together.",
      simpleExplanation: "Break the array apart, sort the tiny pieces, then merge them.",
      actionLabel: "split range",
      pseudocodeLine: 1,
      metrics: cloneMetrics(metrics),
    },
  ]

  function mergeSort(start: number, end: number) {
    if (start >= end) {
      return
    }

    const middle = Math.floor((start + end) / 2)

    steps.push({
      values: [...values],
      activeIndices: rangeIndices(start, end),
      range: [start, end],
      message: `Split the range ${start} to ${end} into two halves.`,
      simpleExplanation: "Focus on a smaller subarray so it is easier to sort.",
      actionLabel: "split range",
      pseudocodeLine: 1,
      metrics: cloneMetrics(metrics),
    })

    mergeSort(start, middle)
    mergeSort(middle + 1, end)

    const leftValues = values.slice(start, middle + 1)
    const rightValues = values.slice(middle + 1, end + 1)
    let leftIndex = 0
    let rightIndex = 0
    let writeIndex = start

    steps.push({
      values: [...values],
      activeIndices: rangeIndices(start, end),
      range: [start, end],
      message: `Merge the sorted halves ${start}-${middle} and ${middle + 1}-${end}.`,
      simpleExplanation: "Now stitch the two sorted halves back into one sorted segment.",
      actionLabel: "start merge",
      pseudocodeLine: 2,
      metrics: cloneMetrics(metrics),
    })

    while (leftIndex < leftValues.length && rightIndex < rightValues.length) {
      metrics.comparisons = (metrics.comparisons ?? 0) + 1

      steps.push({
        values: [...values],
        comparedIndices: [start + leftIndex, middle + 1 + rightIndex],
        activeIndices: [writeIndex],
        range: [start, end],
        message: `Compare ${leftValues[leftIndex]} and ${rightValues[rightIndex]}.`,
        simpleExplanation: "Choose the smaller front value from the two halves.",
        actionLabel: "compare halves",
        pseudocodeLine: 3,
        metrics: cloneMetrics(metrics),
      })

      if (leftValues[leftIndex] <= rightValues[rightIndex]) {
        values[writeIndex] = leftValues[leftIndex]
        leftIndex += 1
      } else {
        values[writeIndex] = rightValues[rightIndex]
        rightIndex += 1
      }

      metrics.writes = (metrics.writes ?? 0) + 1

      steps.push({
        values: [...values],
        activeIndices: [writeIndex],
        range: [start, end],
        message: `Write ${values[writeIndex]} into index ${writeIndex}.`,
        simpleExplanation: "Place the smaller value into the next output position.",
        actionLabel: "write merged value",
        pseudocodeLine: 4,
        metrics: cloneMetrics(metrics),
      })

      writeIndex += 1
    }

    while (leftIndex < leftValues.length) {
      values[writeIndex] = leftValues[leftIndex]
      leftIndex += 1
      metrics.writes = (metrics.writes ?? 0) + 1

      steps.push({
        values: [...values],
        activeIndices: [writeIndex],
        range: [start, end],
        message: `Copy the leftover left-half value ${values[writeIndex]} into index ${writeIndex}.`,
        simpleExplanation: "Only the left half has values remaining, so copy them across.",
        actionLabel: "copy leftovers",
        pseudocodeLine: 5,
        metrics: cloneMetrics(metrics),
      })

      writeIndex += 1
    }

    while (rightIndex < rightValues.length) {
      values[writeIndex] = rightValues[rightIndex]
      rightIndex += 1
      metrics.writes = (metrics.writes ?? 0) + 1

      steps.push({
        values: [...values],
        activeIndices: [writeIndex],
        range: [start, end],
        message: `Copy the leftover right-half value ${values[writeIndex]} into index ${writeIndex}.`,
        simpleExplanation: "Only the right half has values remaining, so copy them across.",
        actionLabel: "copy leftovers",
        pseudocodeLine: 5,
        metrics: cloneMetrics(metrics),
      })

      writeIndex += 1
    }
  }

  mergeSort(0, values.length - 1)

  steps.push({
    values: [...values],
    sortedIndices: prefixIndices(values.length),
    message: "Merge sort is complete.",
    simpleExplanation: "Every split has been merged back into one fully sorted array.",
    actionLabel: "finish sort",
    pseudocodeLine: 5,
    metrics: cloneMetrics(metrics),
  })

  return steps
}

function createQuickSortSteps({ values: initialValues }: AlgorithmExecutionInput): AlgorithmStep[] {
  const values = [...initialValues]
  const metrics: AlgorithmMetrics = { comparisons: 0, swaps: 0, sortedCount: 0 }
  const lockedIndices = new Set<number>()
  const steps: AlgorithmStep[] = [
    {
      values: [...values],
      message: "Quick sort chooses a pivot, partitions around it, and recurses on both sides.",
      simpleExplanation: "Pick one value, move smaller ones left and larger ones right.",
      actionLabel: "choose pivot",
      pseudocodeLine: 1,
      metrics: cloneMetrics(metrics),
    },
  ]

  function snapshotSorted() {
    return Array.from(lockedIndices).sort((left, right) => left - right)
  }

  function quickSort(low: number, high: number) {
    if (low > high) {
      return
    }

    if (low === high) {
      lockedIndices.add(low)
      metrics.sortedCount = lockedIndices.size

      steps.push({
        values: [...values],
        sortedIndices: snapshotSorted(),
        activeIndices: [low],
        range: [low, high],
        message: `Index ${low} now holds a single-value partition, so it is finalized.`,
        simpleExplanation: "A one-item partition is already sorted.",
        actionLabel: "finalize pivot",
        pseudocodeLine: 5,
        metrics: cloneMetrics(metrics),
      })
      return
    }

    const pivotValue = values[high]
    let partitionIndex = low

    steps.push({
      values: [...values],
      activeIndices: [high],
      range: [low, high],
      sortedIndices: snapshotSorted(),
      message: `Choose ${pivotValue} at index ${high} as the pivot.`,
      simpleExplanation: "This pivot value will decide which side each element belongs on.",
      actionLabel: "choose pivot",
      pseudocodeLine: 1,
      metrics: cloneMetrics(metrics),
    })

    for (let scanIndex = low; scanIndex < high; scanIndex += 1) {
      metrics.comparisons = (metrics.comparisons ?? 0) + 1

      steps.push({
        values: [...values],
        comparedIndices: [scanIndex, high],
        range: [low, high],
        sortedIndices: snapshotSorted(),
        message: `Compare ${values[scanIndex]} with pivot ${pivotValue}.`,
        simpleExplanation: "Decide whether this value should go to the left partition.",
        actionLabel: "compare to pivot",
        pseudocodeLine: 2,
        metrics: cloneMetrics(metrics),
      })

      if (values[scanIndex] < pivotValue) {
        ;[values[partitionIndex], values[scanIndex]] = [values[scanIndex], values[partitionIndex]]
        metrics.swaps = (metrics.swaps ?? 0) + 1

        steps.push({
          values: [...values],
          activeIndices: [partitionIndex, scanIndex],
          range: [low, high],
          sortedIndices: snapshotSorted(),
          message: `Move ${values[partitionIndex]} into the left partition at index ${partitionIndex}.`,
          simpleExplanation: "Small values gather on the pivot's left side.",
          actionLabel: "swap into partition",
          pseudocodeLine: 3,
          metrics: cloneMetrics(metrics),
        })

        partitionIndex += 1
      }
    }

    ;[values[partitionIndex], values[high]] = [values[high], values[partitionIndex]]
    metrics.swaps = (metrics.swaps ?? 0) + 1
    lockedIndices.add(partitionIndex)
    metrics.sortedCount = lockedIndices.size

    steps.push({
      values: [...values],
      activeIndices: [partitionIndex, high],
      sortedIndices: snapshotSorted(),
      range: [low, high],
      message: `Place pivot ${values[partitionIndex]} at its final index ${partitionIndex}.`,
      simpleExplanation: "The pivot is now exactly where it belongs in the final sorted order.",
      actionLabel: "place pivot",
      pseudocodeLine: 4,
      metrics: cloneMetrics(metrics),
    })

    quickSort(low, partitionIndex - 1)
    quickSort(partitionIndex + 1, high)
  }

  quickSort(0, values.length - 1)

  metrics.sortedCount = values.length

  steps.push({
    values: [...values],
    sortedIndices: prefixIndices(values.length),
    message: "Quick sort is complete.",
    simpleExplanation: "Every partition has been reduced until the whole array is sorted.",
    actionLabel: "finish sort",
    pseudocodeLine: 5,
    metrics: cloneMetrics(metrics),
  })

  return steps
}

function createHeapSortSteps({ values: initialValues }: AlgorithmExecutionInput): AlgorithmStep[] {
  const values = [...initialValues]
  const metrics: AlgorithmMetrics = { comparisons: 0, swaps: 0, heapSize: values.length, sortedCount: 0 }
  const steps: AlgorithmStep[] = [
    {
      values: [...values],
      message: "Heap sort first builds a max heap, then repeatedly extracts the largest value.",
      simpleExplanation: "Turn the array into a heap so the biggest value is always at the root.",
      actionLabel: "build heap",
      pseudocodeLine: 1,
      metrics: cloneMetrics(metrics),
    },
  ]

  function heapify(heapSize: number, rootIndex: number) {
    let largestIndex = rootIndex
    const leftChildIndex = rootIndex * 2 + 1
    const rightChildIndex = rootIndex * 2 + 2

    if (leftChildIndex < heapSize) {
      metrics.comparisons = (metrics.comparisons ?? 0) + 1

      steps.push({
        values: [...values],
        comparedIndices: [largestIndex, leftChildIndex],
        range: [0, heapSize - 1],
        sortedIndices: suffixIndices(values.length, values.length - heapSize),
        message: `Compare root candidate ${values[largestIndex]} with left child ${values[leftChildIndex]}.`,
        simpleExplanation: "See whether the left child should move above the current root.",
        actionLabel: "compare child",
        pseudocodeLine: 2,
        metrics: cloneMetrics({ ...metrics, heapSize }),
      })

      if (values[leftChildIndex] > values[largestIndex]) {
        largestIndex = leftChildIndex
      }
    }

    if (rightChildIndex < heapSize) {
      metrics.comparisons = (metrics.comparisons ?? 0) + 1

      steps.push({
        values: [...values],
        comparedIndices: [largestIndex, rightChildIndex],
        range: [0, heapSize - 1],
        sortedIndices: suffixIndices(values.length, values.length - heapSize),
        message: `Compare current largest ${values[largestIndex]} with right child ${values[rightChildIndex]}.`,
        simpleExplanation: "Pick the largest among the root and both children.",
        actionLabel: "compare child",
        pseudocodeLine: 2,
        metrics: cloneMetrics({ ...metrics, heapSize }),
      })

      if (values[rightChildIndex] > values[largestIndex]) {
        largestIndex = rightChildIndex
      }
    }

    if (largestIndex !== rootIndex) {
      ;[values[rootIndex], values[largestIndex]] = [values[largestIndex], values[rootIndex]]
      metrics.swaps = (metrics.swaps ?? 0) + 1

      steps.push({
        values: [...values],
        activeIndices: [rootIndex, largestIndex],
        range: [0, heapSize - 1],
        sortedIndices: suffixIndices(values.length, values.length - heapSize),
        message: `Swap ${values[largestIndex]} and ${values[rootIndex]} to restore the heap property.`,
        simpleExplanation: "Move the larger child upward so the heap stays valid.",
        actionLabel: "heapify swap",
        pseudocodeLine: 3,
        metrics: cloneMetrics({ ...metrics, heapSize }),
      })

      heapify(heapSize, largestIndex)
    }
  }

  for (let rootIndex = Math.floor(values.length / 2) - 1; rootIndex >= 0; rootIndex -= 1) {
    heapify(values.length, rootIndex)
  }

  for (let endIndex = values.length - 1; endIndex > 0; endIndex -= 1) {
    ;[values[0], values[endIndex]] = [values[endIndex], values[0]]
    metrics.swaps = (metrics.swaps ?? 0) + 1
    metrics.heapSize = endIndex
    metrics.sortedCount = values.length - endIndex

    steps.push({
      values: [...values],
      activeIndices: [0, endIndex],
      sortedIndices: suffixIndices(values.length, values.length - endIndex),
      range: [0, endIndex - 1],
      message: `Move the heap root into sorted position ${endIndex}.`,
      simpleExplanation: "The largest remaining value leaves the heap and joins the sorted suffix.",
      actionLabel: "extract max",
      pseudocodeLine: 4,
      metrics: cloneMetrics(metrics),
    })

    heapify(endIndex, 0)
  }

  metrics.sortedCount = values.length
  metrics.heapSize = 1

  steps.push({
    values: [...values],
    sortedIndices: prefixIndices(values.length),
    message: "Heap sort is complete.",
    simpleExplanation: "The heap has been drained and the whole array is sorted.",
    actionLabel: "finish sort",
    pseudocodeLine: 5,
    metrics: cloneMetrics(metrics),
  })

  return steps
}

function createLinearSearchSteps({ values: initialValues, targetValue = initialValues[0] }: AlgorithmExecutionInput): AlgorithmStep[] {
  const values = [...initialValues]
  const metrics: AlgorithmMetrics = { comparisons: 0 }
  const steps: AlgorithmStep[] = [
    {
      values: [...values],
      message: `Linear search will check each value in order until it finds ${targetValue}.`,
      simpleExplanation: "Start at the first value and inspect them one by one.",
      actionLabel: "start scan",
      pseudocodeLine: 1,
      metrics: cloneMetrics(metrics),
    },
  ]

  for (let currentIndex = 0; currentIndex < values.length; currentIndex += 1) {
    metrics.comparisons = (metrics.comparisons ?? 0) + 1

    steps.push({
      values: [...values],
      activeIndices: [currentIndex],
      comparedIndices: [currentIndex],
      message: `Inspect index ${currentIndex} and compare ${values[currentIndex]} with ${targetValue}.`,
      simpleExplanation: "Check whether the current card matches the target.",
      actionLabel: "inspect value",
      pseudocodeLine: 2,
      metrics: { ...cloneMetrics(metrics), currentIndex },
    })

    if (values[currentIndex] === targetValue) {
      steps.push({
        values: [...values],
        foundIndices: [currentIndex],
        message: `${targetValue} is found at index ${currentIndex}.`,
        simpleExplanation: "The target matches this value, so the search stops here.",
        actionLabel: "found target",
        pseudocodeLine: 3,
        metrics: { ...cloneMetrics(metrics), currentIndex },
      })
      return steps
    }
  }

  steps.push({
    values: [...values],
    message: `${targetValue} is not present in the dataset.`,
    simpleExplanation: "Every value was checked, but none matched the target.",
    actionLabel: "finish without match",
    pseudocodeLine: 4,
    metrics: cloneMetrics(metrics),
  })

  return steps
}

function createBinarySearchSteps({ values: initialValues, targetValue = initialValues[0] }: AlgorithmExecutionInput): AlgorithmStep[] {
  const values = [...initialValues]
  const metrics: AlgorithmMetrics = { comparisons: 0, low: 0, high: values.length - 1 }
  const steps: AlgorithmStep[] = [
    {
      values: [...values],
      range: [0, values.length - 1],
      message: `Binary search starts over the entire sorted range to find ${targetValue}.`,
      simpleExplanation: "Only sorted data can be cut in half like this.",
      actionLabel: "start range",
      pseudocodeLine: 1,
      metrics: cloneMetrics(metrics),
    },
  ]

  let lowIndex = 0
  let highIndex = values.length - 1

  while (lowIndex <= highIndex) {
    const middleIndex = Math.floor((lowIndex + highIndex) / 2)
    metrics.comparisons = (metrics.comparisons ?? 0) + 1
    metrics.low = lowIndex
    metrics.high = highIndex
    metrics.mid = middleIndex

    steps.push({
      values: [...values],
      activeIndices: [middleIndex],
      range: [lowIndex, highIndex],
      message: `Inspect the middle value ${values[middleIndex]} at index ${middleIndex}.`,
      simpleExplanation: "Jump straight to the middle instead of checking every value.",
      actionLabel: "inspect middle",
      pseudocodeLine: 2,
      metrics: cloneMetrics(metrics),
    })

    if (values[middleIndex] === targetValue) {
      steps.push({
        values: [...values],
        foundIndices: [middleIndex],
        range: [lowIndex, highIndex],
        message: `${targetValue} matches the middle value, so the search is complete.`,
        simpleExplanation: "The target was found exactly at the middle.",
        actionLabel: "found target",
        pseudocodeLine: 3,
        metrics: cloneMetrics(metrics),
      })
      return steps
    }

    if (values[middleIndex] < targetValue) {
      lowIndex = middleIndex + 1
      metrics.low = lowIndex
      metrics.high = highIndex

      steps.push({
        values: [...values],
        range: [lowIndex, highIndex],
        message: `${values[middleIndex]} is too small, so keep the right half.`,
        simpleExplanation: "The target can only be to the right of the middle now.",
        actionLabel: "move low pointer",
        pseudocodeLine: 4,
        metrics: cloneMetrics(metrics),
      })

      continue
    }

    highIndex = middleIndex - 1
    metrics.low = lowIndex
    metrics.high = highIndex

    steps.push({
      values: [...values],
      range: [lowIndex, highIndex],
      message: `${values[middleIndex]} is too large, so keep the left half.`,
      simpleExplanation: "The target can only be to the left of the middle now.",
      actionLabel: "move high pointer",
      pseudocodeLine: 4,
      metrics: cloneMetrics(metrics),
    })
  }

  steps.push({
    values: [...values],
    message: `${targetValue} is not present in the sorted dataset.`,
    simpleExplanation: "The search range became empty before a match was found.",
    actionLabel: "finish without match",
    pseudocodeLine: 4,
    metrics: cloneMetrics(metrics),
  })

  return steps
}

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

export const algorithmCatalog: AlgorithmDefinition[] = [
  {
    id: "bubble-sort",
    name: "Bubble Sort",
    category: "sorting",
    difficulty: "beginner",
    datasetKind: "array",
    visualMode: "bars",
    description: "Repeatedly swaps adjacent out-of-order values so larger numbers drift to the end.",
    concepts: ["adjacent comparison", "swapping", "stable", "in-place"],
    pseudocode: [
      "repeat passes from left to right",
      "compare neighboring values",
      "swap the pair if it is out of order",
      "stop if a full pass makes no swaps",
    ],
    complexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
    notes: {
      intuition: "Bubble sort repeatedly fixes local inversions until the biggest values float to the right edge.",
      tradeoffs: [
        "Very easy to understand and animate.",
        "Too slow for large datasets.",
        "Early-exit optimization helps nearly sorted arrays.",
      ],
      interviewTips: [
        "Mention that bubble sort is stable and in-place.",
        "Explain why the best case becomes linear with an early-exit flag.",
      ],
      whenToUse: "Use it mainly for learning and for discussing loop invariants, not for production sorting.",
    },
    defaultValues: sortingDataset,
    createSteps: createBubbleSortSteps,
  },
  {
    id: "selection-sort",
    name: "Selection Sort",
    category: "sorting",
    difficulty: "beginner",
    datasetKind: "array",
    visualMode: "bars",
    description: "Selects the minimum value from the unsorted suffix and places it into the next sorted slot.",
    concepts: ["minimum scan", "selection", "in-place", "prefix growth"],
    pseudocode: [
      "choose the first unsorted index",
      "scan the remaining values for the minimum",
      "swap that minimum into the chosen slot",
      "move the sorted boundary one step right",
    ],
    complexity: { best: "O(n²)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
    notes: {
      intuition: "Each pass makes one permanent choice: the next smallest value.",
      tradeoffs: [
        "Uses few swaps compared with bubble sort.",
        "Still scans the remaining array every pass.",
        "Not stable in its usual form.",
      ],
      interviewTips: [
        "Point out that the number of comparisons does not improve on nearly sorted input.",
        "Good contrast against insertion sort when discussing writes vs comparisons.",
      ],
      whenToUse: "Useful when swaps are expensive but comparisons are cheap, or when teaching simple in-place sorting.",
    },
    defaultValues: sortingDataset,
    createSteps: createSelectionSortSteps,
  },
  {
    id: "insertion-sort",
    name: "Insertion Sort",
    category: "sorting",
    difficulty: "beginner",
    datasetKind: "array",
    visualMode: "bars",
    description: "Builds a sorted prefix by inserting each new value into the right gap.",
    concepts: ["sorted prefix", "shifting", "stable", "adaptive"],
    pseudocode: [
      "treat the left side as a sorted prefix",
      "pick the next unsorted value",
      "shift larger sorted values rightward",
      "insert the picked value into the gap",
    ],
    complexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
    notes: {
      intuition: "It works the same way many people sort cards in their hands.",
      tradeoffs: [
        "Great for small or nearly sorted datasets.",
        "Shifts can make it slow on long random arrays.",
        "Stable and in-place.",
      ],
      interviewTips: [
        "Mention that insertion sort often appears inside hybrid algorithms for small partitions.",
        "Explain why nearly sorted data is its sweet spot.",
      ],
      whenToUse: "Use for small datasets, nearly sorted data, or as a base case inside more advanced sorts.",
    },
    defaultValues: sortingDataset,
    createSteps: createInsertionSortSteps,
  },
  {
    id: "merge-sort",
    name: "Merge Sort",
    category: "sorting",
    difficulty: "intermediate",
    datasetKind: "array",
    visualMode: "bars",
    description: "Recursively splits the array and merges sorted halves into a fully ordered result.",
    concepts: ["divide and conquer", "merging", "stable", "recursion"],
    pseudocode: [
      "split the range into two halves",
      "sort both halves recursively",
      "compare the front values of each half",
      "write the smaller value into the merged output",
      "copy any leftovers into the output",
    ],
    complexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(n)" },
    notes: {
      intuition: "Small sorted pieces are easy to combine, so merge sort focuses on creating those pieces first.",
      tradeoffs: [
        "Predictable O(n log n) time.",
        "Needs extra memory for merging.",
        "Stable, which helps when equal keys matter.",
      ],
      interviewTips: [
        "Explain the divide-and-conquer recurrence and why it leads to O(n log n).",
        "Mention linked-list merge sort as a common variant.",
      ],
      whenToUse: "Use when stable ordering matters and extra memory is acceptable for consistent performance.",
    },
    defaultValues: sortingDataset,
    createSteps: createMergeSortSteps,
  },
  {
    id: "quick-sort",
    name: "Quick Sort",
    category: "sorting",
    difficulty: "intermediate",
    datasetKind: "array",
    visualMode: "bars",
    description: "Partitions the array around a pivot and recursively sorts the resulting partitions.",
    concepts: ["pivot", "partitioning", "divide and conquer", "in-place"],
    pseudocode: [
      "choose a pivot value",
      "scan the partition against the pivot",
      "swap smaller values into the left partition",
      "place the pivot into its final index",
      "recurse on both partitions",
    ],
    complexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n²)", space: "O(log n)" },
    notes: {
      intuition: "Quick sort wins by placing pivots correctly and shrinking the unsorted problem quickly.",
      tradeoffs: [
        "Fast in practice with good pivots.",
        "Worst-case time degrades to O(n²).",
        "In-place but usually not stable.",
      ],
      interviewTips: [
        "Discuss pivot strategy and how randomized pivots reduce worst-case risk.",
        "Be ready to explain partition invariants.",
      ],
      whenToUse: "Use when average-case speed and in-place behavior matter more than stability.",
    },
    defaultValues: sortingDataset,
    createSteps: createQuickSortSteps,
  },
  {
    id: "heap-sort",
    name: "Heap Sort",
    category: "sorting",
    difficulty: "advanced",
    datasetKind: "array",
    visualMode: "bars",
    description: "Builds a max heap and repeatedly extracts the root to produce a sorted suffix.",
    concepts: ["heap", "tree in array", "extract max", "in-place"],
    pseudocode: [
      "build a max heap from the array",
      "compare a node with its children",
      "swap when a child should move upward",
      "move the root into the sorted suffix",
      "repeat heapify on the reduced heap",
    ],
    complexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(1)" },
    notes: {
      intuition: "The heap keeps the largest remaining value at the root, ready for extraction.",
      tradeoffs: [
        "Guaranteed O(n log n) time.",
        "Not stable.",
        "Can have worse cache behavior than quick sort.",
      ],
      interviewTips: [
        "Explain how the heap maps onto array indices.",
        "Call out that the build-heap phase is O(n), not O(n log n).",
      ],
      whenToUse: "Use when you want in-place O(n log n) performance with strong worst-case guarantees.",
    },
    defaultValues: sortingDataset,
    createSteps: createHeapSortSteps,
  },
  {
    id: "linear-search",
    name: "Linear Search",
    category: "searching",
    difficulty: "beginner",
    datasetKind: "array",
    visualMode: "cards",
    description: "Checks each value in sequence until a match is found or the array ends.",
    concepts: ["sequential scan", "no preprocessing", "works on unsorted data"],
    pseudocode: [
      "start at index 0",
      "inspect the current value",
      "return if it matches the target",
      "continue until the array ends",
    ],
    complexity: { best: "O(1)", average: "O(n)", worst: "O(n)", space: "O(1)" },
    notes: {
      intuition: "Linear search trades speed for simplicity by never assuming anything about the data.",
      tradeoffs: [
        "Works on unsorted input.",
        "No setup cost.",
        "Slow on large datasets.",
      ],
      interviewTips: [
        "Use it as the baseline when comparing against binary search.",
        "Mention that it is the only choice if the data is unsorted and cannot be preprocessed.",
      ],
      whenToUse: "Use for tiny datasets, streaming data, or one-off checks on unsorted collections.",
    },
    defaultValues: searchDataset,
    defaultTargetValue: 18,
    targetType: "number",
    createSteps: createLinearSearchSteps,
  },
  {
    id: "binary-search",
    name: "Binary Search",
    category: "searching",
    difficulty: "beginner",
    datasetKind: "array",
    visualMode: "cards",
    description: "Halves the remaining search range around the middle element of a sorted array.",
    concepts: ["sorted input", "middle index", "divide and conquer", "range halving"],
    pseudocode: [
      "set low and high to the array bounds",
      "inspect the middle element",
      "return if the middle matches the target",
      "otherwise keep only the half that can still contain the target",
    ],
    complexity: { best: "O(1)", average: "O(log n)", worst: "O(log n)", space: "O(1)" },
    notes: {
      intuition: "Binary search throws away half the remaining possibilities after every comparison.",
      tradeoffs: [
        "Very fast on sorted data.",
        "Requires random access and sorted input.",
        "Not helpful when data changes constantly unless you keep it sorted.",
      ],
      interviewTips: [
        "Be careful with low/high updates and off-by-one errors.",
        "State the invariant that the target, if present, must stay inside the current range.",
      ],
      whenToUse: "Use when the data is sorted and you need fast repeated lookups.",
    },
    defaultValues: binarySearchDataset,
    defaultTargetValue: 23,
    targetType: "number",
    requiresSortedInput: true,
    createSteps: createBinarySearchSteps,
  },
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

export const algorithmCatalogById = Object.fromEntries(
  algorithmCatalog.map((algorithmDefinition) => [algorithmDefinition.id, algorithmDefinition]),
) as Record<string, AlgorithmDefinition>

export const algorithmCategories = Array.from(
  new Set(algorithmCatalog.map((algorithmDefinition) => algorithmDefinition.category)),
)

export const algorithmDifficulties = Array.from(
  new Set(algorithmCatalog.map((algorithmDefinition) => algorithmDefinition.difficulty)),
)

export const graphTargetOptions = learningGraph.nodes.map((node) => ({
  label: node.label,
  value: node.id,
}))
