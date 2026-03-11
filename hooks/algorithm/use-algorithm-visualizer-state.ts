"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { graphTargetOptions } from "@/config/algorithms"
import { storageKey } from "@/components/algorithms/AlgorithmVisualizer.constants"
import type { AlgorithmDefinition } from "@/types/algorithm"
import type { PersistedState } from "@/types/algorithm-visualizer"
import {
  getCompareCandidates,
  getDefaultArrayValues,
  getDefaultTargetValue,
  isValidAlgorithmId,
  isValidGraphTarget,
  parseArrayInput,
  randomArrayValues,
  readPersistedState,
} from "@/utils/algorithm-visualizer"

export function useAlgorithmVisualizerState({
  initialAlgorithmId,
  primaryAlgorithm,
}: {
  initialAlgorithmId: string
  primaryAlgorithm: AlgorithmDefinition
}) {
  const pathname = usePathname() ?? `/alg/${initialAlgorithmId}`
  const router = useRouter()
  const defaultArrayValues = getDefaultArrayValues(primaryAlgorithm)

  const [hasHydrated, setHasHydrated] = useState(false)
  const [secondaryAlgorithmId, setSecondaryAlgorithmId] = useState("")
  const [isCompareMode, setIsCompareMode] = useState(false)
  const [quizMode, setQuizMode] = useState(false)
  const [arrayDraftText, setArrayDraftText] = useState(defaultArrayValues.join(", "))
  const [appliedArrayValues, setAppliedArrayValues] = useState(defaultArrayValues)
  const [targetDraftValue, setTargetDraftValue] = useState(String(getDefaultTargetValue(primaryAlgorithm)))
  const [appliedTargetValue, setAppliedTargetValue] = useState(getDefaultTargetValue(primaryAlgorithm))
  const [graphTargetNodeId, setGraphTargetNodeId] = useState(
    primaryAlgorithm?.graph?.defaultTargetNodeId ?? graphTargetOptions[graphTargetOptions.length - 1]?.value ?? "G",
  )
  const [inputFeedback, setInputFeedback] = useState<string | null>(null)
  const [shareableUrlFeedback, setShareableUrlFeedback] = useState<string | null>(null)

  const availableCompareAlgorithms = useMemo(
    () => getCompareCandidates(primaryAlgorithm),
    [primaryAlgorithm],
  )

  // Hydration effect: read URL params and localStorage on mount
  useEffect(() => {
    const storedState = readPersistedState()
    const query = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "")
    const compareValue = query.get("compare") === "1" || storedState?.isCompareMode === true
    const quizValue = query.get("quiz") === "1" || storedState?.quizMode === true
    const parsedValues = parseArrayInput(query.get("data") ?? storedState?.arrayValues?.join(", ") ?? "")
    const arrayValues = parsedValues.length > 0 ? parsedValues : getDefaultArrayValues(primaryAlgorithm)
    const targetValue = Number(
      query.get("target") ?? storedState?.targetValue ?? getDefaultTargetValue(primaryAlgorithm),
    )
    const safeTargetValue = Number.isFinite(targetValue)
      ? Math.max(1, Math.min(99, Math.round(targetValue)))
      : getDefaultTargetValue(primaryAlgorithm)
    const safeGraphTarget = isValidGraphTarget(query.get("nodeTarget"))
      ? (query.get("nodeTarget") as string)
      : isValidGraphTarget(storedState?.graphTargetNodeId)
        ? (storedState?.graphTargetNodeId as string)
        : primaryAlgorithm.graph?.defaultTargetNodeId ??
          graphTargetOptions[graphTargetOptions.length - 1]?.value ??
          "G"
    const requestedSecondaryId = isValidAlgorithmId(query.get("secondary"))
      ? (query.get("secondary") as string)
      : isValidAlgorithmId(storedState?.secondaryAlgorithmId)
        ? (storedState?.secondaryAlgorithmId as string)
        : availableCompareAlgorithms[0]?.id ?? ""
    const safeSecondaryId = availableCompareAlgorithms.some(
      (algorithmDefinition) => algorithmDefinition.id === requestedSecondaryId,
    )
      ? requestedSecondaryId
      : availableCompareAlgorithms[0]?.id ?? ""

    setSecondaryAlgorithmId(safeSecondaryId)
    setIsCompareMode(compareValue && availableCompareAlgorithms.length > 0)
    setQuizMode(quizValue)
    setAppliedArrayValues(arrayValues)
    setArrayDraftText(arrayValues.join(", "))
    setAppliedTargetValue(safeTargetValue)
    setTargetDraftValue(String(safeTargetValue))
    setGraphTargetNodeId(safeGraphTarget)
    setHasHydrated(true)
  }, [availableCompareAlgorithms, initialAlgorithmId, primaryAlgorithm])

  // Keep secondary algorithm selection valid when available options change
  useEffect(() => {
    if (availableCompareAlgorithms.length === 0) {
      setIsCompareMode(false)
      setSecondaryAlgorithmId("")
      return
    }

    if (!availableCompareAlgorithms.some((algorithmDefinition) => algorithmDefinition.id === secondaryAlgorithmId)) {
      setSecondaryAlgorithmId(availableCompareAlgorithms[0].id)
    }
  }, [availableCompareAlgorithms, secondaryAlgorithmId])

  const secondaryAlgorithm = useMemo(
    () =>
      availableCompareAlgorithms.find((algorithmDefinition) => algorithmDefinition.id === secondaryAlgorithmId) ??
      availableCompareAlgorithms[0],
    [availableCompareAlgorithms, secondaryAlgorithmId],
  )

  // Persist state to localStorage and sync URL params
  useEffect(() => {
    if (!hasHydrated) {
      return
    }

    const persistedState: PersistedState = {
      selectedAlgorithmId: primaryAlgorithm.id,
      secondaryAlgorithmId: secondaryAlgorithm?.id,
      isCompareMode,
      quizMode,
      arrayValues: appliedArrayValues,
      targetValue: appliedTargetValue,
      graphTargetNodeId,
    }

    window.localStorage.setItem(storageKey, JSON.stringify(persistedState))

    const nextParams = new URLSearchParams()

    if (isCompareMode && secondaryAlgorithm) {
      nextParams.set("compare", "1")
      nextParams.set("secondary", secondaryAlgorithm.id)
    }
    if (quizMode) {
      nextParams.set("quiz", "1")
    }
    nextParams.set("data", appliedArrayValues.join(","))
    nextParams.set("target", String(appliedTargetValue))
    nextParams.set("nodeTarget", graphTargetNodeId)

    const nextQueryString = nextParams.toString()
    const nextUrl = nextQueryString ? `${pathname}?${nextQueryString}` : pathname
    const currentUrl = `${pathname}${typeof window !== "undefined" ? window.location.search : ""}`

    if (nextUrl !== currentUrl) {
      router.replace(nextUrl, { scroll: false })
    }
  }, [
    appliedArrayValues,
    appliedTargetValue,
    graphTargetNodeId,
    hasHydrated,
    isCompareMode,
    pathname,
    primaryAlgorithm,
    quizMode,
    router,
    secondaryAlgorithm,
  ])

  const currentShareableUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}${window.location.search}`
      : pathname

  const copyShareableUrl = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      setShareableUrlFeedback("Copy failed. Please copy the URL manually.")
      return
    }

    try {
      await navigator.clipboard.writeText(currentShareableUrl)
      setShareableUrlFeedback("URL copied to clipboard.")
    } catch {
      setShareableUrlFeedback("Copy failed. Please copy the URL manually.")
    }
  }

  const applyArrayInput = () => {
    const parsedValues = parseArrayInput(arrayDraftText)

    if (parsedValues.length < 3) {
      setInputFeedback("Enter at least 3 integers so the visualization has enough steps.")
      return
    }

    setAppliedArrayValues(parsedValues)
    setArrayDraftText(parsedValues.join(", "))
    setInputFeedback("Custom dataset applied.")
  }

  const resetArrayInput = () => {
    const nextValues = getDefaultArrayValues(primaryAlgorithm)
    const nextTargetValue = getDefaultTargetValue(primaryAlgorithm)

    setAppliedArrayValues(nextValues)
    setArrayDraftText(nextValues.join(", "))
    setAppliedTargetValue(nextTargetValue)
    setTargetDraftValue(String(nextTargetValue))
    setGraphTargetNodeId(
      primaryAlgorithm.graph?.defaultTargetNodeId ?? graphTargetOptions[graphTargetOptions.length - 1]?.value ?? "G",
    )
    setInputFeedback("Defaults restored for the current algorithm.")
  }

  const randomizeDataset = () => {
    const nextValues = randomArrayValues(Math.max(Math.min(appliedArrayValues.length, 10), 6))
    setAppliedArrayValues(nextValues)
    setArrayDraftText(nextValues.join(", "))
    setInputFeedback("Random dataset generated.")
  }

  const applyTargetValue = () => {
    const parsedTarget = Number(targetDraftValue)

    if (!Number.isFinite(parsedTarget)) {
      setInputFeedback("Target must be a valid integer.")
      return
    }

    const nextTargetValue = Math.max(1, Math.min(99, Math.round(parsedTarget)))
    setAppliedTargetValue(nextTargetValue)
    setTargetDraftValue(String(nextTargetValue))
    setInputFeedback("Target updated.")
  }

  const resetGraphTarget = () => {
    const nextTarget =
      primaryAlgorithm.graph?.defaultTargetNodeId ?? graphTargetOptions[graphTargetOptions.length - 1]?.value ?? "G"
    setGraphTargetNodeId(nextTarget)
    setInputFeedback("Graph target reset.")
  }

  const applyScenarioPreset = (preset: { arrayValues?: number[]; targetValue?: number; graphTargetNodeId?: string; label: string }) => {
    if (preset.arrayValues?.length) {
      setAppliedArrayValues(preset.arrayValues)
      setArrayDraftText(preset.arrayValues.join(", "))
    }

    if (typeof preset.targetValue === "number") {
      setAppliedTargetValue(preset.targetValue)
      setTargetDraftValue(String(preset.targetValue))
    }

    if (typeof preset.graphTargetNodeId === "string") {
      setGraphTargetNodeId(preset.graphTargetNodeId)
    }

    setInputFeedback(`${preset.label} scenario loaded.`)
  }

  return {
    // State
    isCompareMode,
    setIsCompareMode,
    quizMode,
    setQuizMode,
    arrayDraftText,
    setArrayDraftText,
    appliedArrayValues,
    targetDraftValue,
    setTargetDraftValue,
    appliedTargetValue,
    graphTargetNodeId,
    setGraphTargetNodeId,
    inputFeedback,
    shareableUrlFeedback,
    // Derived
    availableCompareAlgorithms,
    secondaryAlgorithm,
    secondaryAlgorithmId,
    setSecondaryAlgorithmId,
    currentShareableUrl,
    // Handlers
    copyShareableUrl,
    applyArrayInput,
    resetArrayInput,
    randomizeDataset,
    applyTargetValue,
    resetGraphTarget,
    applyScenarioPreset,
  }
}
