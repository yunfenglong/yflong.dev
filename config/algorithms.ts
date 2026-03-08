import type { AlgorithmDefinition, AlgorithmStep } from "@/types/algorithm"

const sortingDataset = [8, 3, 5, 1, 9, 6, 2, 7]
const searchDataset = [2, 5, 8, 12, 16, 23, 38, 56, 72]

function createSortedPrefixIndices(prefixLength: number) {
  return Array.from({ length: prefixLength }, (_, prefixIndex) => prefixIndex)
}

function createSortedSuffixIndices(totalLength: number, suffixLength: number) {
  return Array.from({ length: suffixLength }, (_, suffixIndex) => totalLength - suffixLength + suffixIndex)
}

function createBubbleSortSteps(initialValues: number[]): AlgorithmStep[] {
  const values = [...initialValues]
  const steps: AlgorithmStep[] = [
    {
      values: [...values],
      message: "Start from the left and repeatedly swap neighboring values that are out of order.",
    },
  ]

  for (let passIndex = 0; passIndex < values.length - 1; passIndex += 1) {
    let swappedInPass = false

    for (let compareIndex = 0; compareIndex < values.length - passIndex - 1; compareIndex += 1) {
      const nextIndex = compareIndex + 1

      steps.push({
        values: [...values],
        comparedIndices: [compareIndex, nextIndex],
        sortedIndices: createSortedSuffixIndices(values.length, passIndex),
        message: `Compare ${values[compareIndex]} and ${values[nextIndex]}.`,
      })

      if (values[compareIndex] > values[nextIndex]) {
        ;[values[compareIndex], values[nextIndex]] = [values[nextIndex], values[compareIndex]]
        swappedInPass = true

        steps.push({
          values: [...values],
          activeIndices: [compareIndex, nextIndex],
          sortedIndices: createSortedSuffixIndices(values.length, passIndex),
          message: `Swap them so the larger value drifts rightward.`,
        })
      }
    }

    steps.push({
      values: [...values],
      sortedIndices: createSortedSuffixIndices(values.length, passIndex + 1),
      message: `Pass ${passIndex + 1} finishes. The rightmost value is now locked in place.`,
    })

    if (!swappedInPass) {
      steps.push({
        values: [...values],
        sortedIndices: createSortedPrefixIndices(values.length),
        message: "No swaps happened in this pass, so the array is already sorted.",
      })
      return steps
    }
  }

  steps.push({
    values: [...values],
    sortedIndices: createSortedPrefixIndices(values.length),
    message: "Bubble sort is complete.",
  })

  return steps
}

function createSelectionSortSteps(initialValues: number[]): AlgorithmStep[] {
  const values = [...initialValues]
  const steps: AlgorithmStep[] = [
    {
      values: [...values],
      message: "Selection sort scans the unsorted region and places its minimum at the front.",
    },
  ]

  for (let positionIndex = 0; positionIndex < values.length - 1; positionIndex += 1) {
    let smallestIndex = positionIndex

    steps.push({
      values: [...values],
      activeIndices: [positionIndex],
      sortedIndices: createSortedPrefixIndices(positionIndex),
      message: `Search for the smallest value from index ${positionIndex} onward.`,
    })

    for (let scanIndex = positionIndex + 1; scanIndex < values.length; scanIndex += 1) {
      steps.push({
        values: [...values],
        comparedIndices: [smallestIndex, scanIndex],
        sortedIndices: createSortedPrefixIndices(positionIndex),
        message: `Compare current minimum ${values[smallestIndex]} with ${values[scanIndex]}.`,
      })

      if (values[scanIndex] < values[smallestIndex]) {
        smallestIndex = scanIndex

        steps.push({
          values: [...values],
          activeIndices: [smallestIndex],
          sortedIndices: createSortedPrefixIndices(positionIndex),
          message: `${values[smallestIndex]} becomes the new minimum candidate.`,
        })
      }
    }

    if (smallestIndex !== positionIndex) {
      ;[values[positionIndex], values[smallestIndex]] = [values[smallestIndex], values[positionIndex]]

      steps.push({
        values: [...values],
        activeIndices: [positionIndex, smallestIndex],
        sortedIndices: createSortedPrefixIndices(positionIndex),
        message: `Swap the minimum into index ${positionIndex}.`,
      })
    }

    steps.push({
      values: [...values],
      sortedIndices: createSortedPrefixIndices(positionIndex + 1),
      message: `Index ${positionIndex} is now fixed in sorted order.`,
    })
  }

  steps.push({
    values: [...values],
    sortedIndices: createSortedPrefixIndices(values.length),
    message: "Selection sort is complete.",
  })

  return steps
}

function createInsertionSortSteps(initialValues: number[]): AlgorithmStep[] {
  const values = [...initialValues]
  const steps: AlgorithmStep[] = [
    {
      values: [...values],
      sortedIndices: [0],
      message: "Treat the first value as a sorted prefix, then insert each new value into it.",
    },
  ]

  for (let currentIndex = 1; currentIndex < values.length; currentIndex += 1) {
    const currentValue = values[currentIndex]
    let insertIndex = currentIndex

    steps.push({
      values: [...values],
      activeIndices: [currentIndex],
      sortedIndices: createSortedPrefixIndices(currentIndex),
      message: `Pick up ${currentValue} and walk left until it reaches the correct position.`,
    })

    while (insertIndex > 0 && values[insertIndex - 1] > currentValue) {
      steps.push({
        values: [...values],
        comparedIndices: [insertIndex - 1, insertIndex],
        sortedIndices: createSortedPrefixIndices(currentIndex),
        message: `${values[insertIndex - 1]} is greater than ${currentValue}, so shift it right.`,
      })

      values[insertIndex] = values[insertIndex - 1]

      steps.push({
        values: [...values],
        activeIndices: [insertIndex - 1, insertIndex],
        sortedIndices: createSortedPrefixIndices(currentIndex),
        message: `Shift ${values[insertIndex]} one slot to the right.`,
      })

      insertIndex -= 1
    }

    values[insertIndex] = currentValue

    steps.push({
      values: [...values],
      activeIndices: [insertIndex],
      sortedIndices: createSortedPrefixIndices(currentIndex + 1),
      message: `Insert ${currentValue} at index ${insertIndex}.`,
    })
  }

  steps.push({
    values: [...values],
    sortedIndices: createSortedPrefixIndices(values.length),
    message: "Insertion sort is complete.",
  })

  return steps
}

function createBinarySearchSteps(initialValues: number[], targetValue = 23): AlgorithmStep[] {
  const values = [...initialValues]
  const steps: AlgorithmStep[] = [
    {
      values: [...values],
      range: [0, values.length - 1],
      message: `Binary search starts with the full sorted range and looks for ${targetValue}.`,
    },
  ]

  let lowIndex = 0
  let highIndex = values.length - 1

  while (lowIndex <= highIndex) {
    const middleIndex = Math.floor((lowIndex + highIndex) / 2)

    steps.push({
      values: [...values],
      activeIndices: [middleIndex],
      range: [lowIndex, highIndex],
      message: `Inspect the middle value ${values[middleIndex]} at index ${middleIndex}.`,
    })

    if (values[middleIndex] === targetValue) {
      steps.push({
        values: [...values],
        foundIndices: [middleIndex],
        range: [lowIndex, highIndex],
        message: `${targetValue} matches the middle value, so the search is complete.`,
      })
      return steps
    }

    if (values[middleIndex] < targetValue) {
      steps.push({
        values: [...values],
        range: [middleIndex + 1, highIndex],
        message: `${values[middleIndex]} is too small, so discard the left half.`,
      })
      lowIndex = middleIndex + 1
      continue
    }

    steps.push({
      values: [...values],
      range: [lowIndex, middleIndex - 1],
      message: `${values[middleIndex]} is too large, so discard the right half.`,
    })
    highIndex = middleIndex - 1
  }

  steps.push({
    values: [...values],
    message: `${targetValue} is not present in the dataset.`,
  })

  return steps
}

export const algorithmCatalog: AlgorithmDefinition[] = [
  {
    id: "bubble-sort",
    name: "Bubble Sort",
    category: "sorting",
    description:
      "Simple comparison sort that repeatedly pushes large values toward the end by swapping adjacent pairs.",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    concepts: ["adjacent comparison", "swapping", "stable", "in-place"],
    initialValues: sortingDataset,
    pseudocode: [
      "repeat for each pass from left to right",
      "compare neighboring values",
      "swap if the pair is out of order",
      "stop early if a pass makes no swaps",
    ],
    createSteps: createBubbleSortSteps,
  },
  {
    id: "selection-sort",
    name: "Selection Sort",
    category: "sorting",
    description:
      "Finds the minimum from the unsorted suffix and places it into the next sorted position.",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    concepts: ["minimum scan", "selection", "in-place", "fixed boundary"],
    initialValues: sortingDataset,
    pseudocode: [
      "start at the first unsorted index",
      "scan the remaining values for the minimum",
      "swap that minimum into the current position",
      "move the sorted boundary one step right",
    ],
    createSteps: createSelectionSortSteps,
  },
  {
    id: "insertion-sort",
    name: "Insertion Sort",
    category: "sorting",
    description:
      "Builds a sorted prefix one value at a time by shifting larger values rightward.",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    concepts: ["sorted prefix", "shifting", "stable", "adaptive"],
    initialValues: sortingDataset,
    pseudocode: [
      "treat the left side as sorted",
      "pick the next value from the unsorted side",
      "shift larger sorted values one step right",
      "insert the picked value into the gap",
    ],
    createSteps: createInsertionSortSteps,
  },
  {
    id: "binary-search",
    name: "Binary Search",
    category: "searching",
    description:
      "Searches a sorted array by repeatedly halving the candidate range around the middle element.",
    timeComplexity: "O(log n)",
    spaceComplexity: "O(1)",
    concepts: ["sorted data", "middle element", "divide and conquer", "range halving"],
    initialValues: searchDataset,
    targetValue: 23,
    pseudocode: [
      "set low and high to the array bounds",
      "inspect the middle element",
      "return if the middle matches the target",
      "otherwise keep only the half that can still contain the target",
    ],
    createSteps: createBinarySearchSteps,
  },
]
