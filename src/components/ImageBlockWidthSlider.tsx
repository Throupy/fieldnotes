import { memo, useCallback, useEffect, useState } from 'react'

export type ImageBlockWidthProps = {
  onChange: (value: number) => void
  value: number
}

export const ImageBlockWidthSlider = memo(({ onChange, value }: ImageBlockWidthProps) => {
  const [currentValue, setCurrentValue] = useState(value)

  useEffect(() => {
    setCurrentValue(value)
  }, [value])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = parseInt(e.target.value)
      onChange(nextValue)
      setCurrentValue(nextValue)
    },
    [onChange],
  )

  return (
    <div className="flex items-center gap-2">
      <input
        className="h-2 bg-[#696969] border-0 rounded appearance-none fill-[#393939] accent-white cursor-pointer"
        type="range"
        min="25"
        max="100"
        step="25"
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        value={currentValue}
      />
      <span className="text-xs font-semibold text-neutral-500 select-none">{value}%</span>
    </div>
  )
})
