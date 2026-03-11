import type {
  AlgorithmDefinition,
  AlgorithmExecutionInput,
  AlgorithmMetrics,
  AlgorithmStep,
} from "@/types/algorithm"
import {
  cloneMetrics,
  prefixIndices,
  rangeIndices,
  sortingDataset,
  suffixIndices,
} from "@/config/algorithms/shared"

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
export const sortingAlgorithms: AlgorithmDefinition[] = [
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
]
