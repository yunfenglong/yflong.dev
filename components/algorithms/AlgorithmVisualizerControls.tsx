"use client"

import type { ToolbarOption } from "@/types/algorithm-visualizer"

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: ToolbarOption<T>[]
  onChange: (value: T) => void
}) {
  return (
    <div className="space-y-2">
      <p className="max-w-full truncate text-[0.55rem] uppercase tracking-[0.12em] text-[#8f8475] sm:text-[0.66rem] sm:tracking-[0.14em]">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = option.value === value

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-full border px-3 py-1.5 text-[0.66rem] uppercase tracking-[0.12em] transition-colors ${
                isActive
                  ? "border-[#b3997a] bg-[#eadfcd] text-[#3f3528]"
                  : "border-[#d7ccbc] bg-[#f8f3eb] text-[#5b5143] hover:bg-[#eee5d7]"
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function ToggleControl({
  label,
  enabled,
  disabled,
  onToggle,
}: {
  label: string
  enabled: boolean
  disabled?: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.66rem] uppercase tracking-[0.12em] transition-colors ${
        enabled
          ? "border-[#b3997a] bg-[#eadfcd] text-[#3f3528]"
          : "border-[#d7ccbc] bg-[#f8f3eb] text-[#5b5143] hover:bg-[#eee5d7]"
      } disabled:cursor-not-allowed disabled:opacity-45`}
    >
      <span>{label}</span>
      <span className={`h-2 w-2 rounded-full ${enabled ? "bg-[#8c7150]" : "bg-[#c6baaa]"}`} />
    </button>
  )
}
