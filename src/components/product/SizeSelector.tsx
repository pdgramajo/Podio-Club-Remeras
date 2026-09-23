import type { ReactNode } from "react";
import type { ProductSize } from "../../types/product";
import { splitSizes } from "../../utils/sizes";

interface SizeSelectorProps {
  talles: ProductSize[];
  /** Currently selected size, or null before the user picks one. */
  selected: ProductSize | null;
  onSelect: (size: ProductSize) => void;
}

/**
 * Size selector (product-catalog "Size selector"): renders adult sizes and
 * kids sizes as distinct groups labeled in Spanish, from the product's
 * canonical `talles`. Exactly one size can be selected and it is visually
 * highlighted (aria-pressed); a product with a single group renders that
 * group only ("Adult-only product").
 */
export function SizeSelector({ talles, selected, onSelect }: SizeSelectorProps) {
  const { adults, kids } = splitSizes(talles);

  const renderGroup = (label: string, sizes: readonly ProductSize[]): ReactNode => {
    if (sizes.length === 0) {
      return null;
    }
    return (
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-semibold text-ink/70">{label}</legend>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            const isSelected = selected === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => onSelect(size)}
                aria-pressed={isSelected}
                className={`min-w-12 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  isSelected
                    ? "border-podio-600 bg-podio-600 text-white"
                    : "border-ink/15 bg-white text-ink hover:border-podio-600"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </fieldset>
    );
  };

  return (
    <div data-testid="size-selector" className="flex flex-col gap-5">
      {renderGroup("Adulto", adults)}
      {renderGroup("Niño", kids)}
    </div>
  );
}
