import type {
  AlgorithmDefinition,
  AlgorithmExecutionInput,
  AlgorithmMetrics,
  AlgorithmStep,
} from "@/types/algorithm"
import {
  binarySearchDataset,
  cloneMetrics,
  rangeIndices,
  searchDataset,
} from "@/config/algorithms/shared"

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
export const searchingAlgorithms: AlgorithmDefinition[] = [
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
]
