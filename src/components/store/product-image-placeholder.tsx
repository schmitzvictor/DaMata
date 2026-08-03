import { cn } from "@/lib/utils";

/**
 * Diagonal-stripe placeholder shown wherever a product has no image yet
 * (every product does, until the storage integration lands). Matches the
 * approved design's "[ foto: ... ]" mockup treatment, minus the caption.
 */
export function ProductImagePlaceholder({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn(
        "relative h-full w-full bg-[repeating-linear-gradient(135deg,#E6DFD1_0_12px,#EEE8DC_12px_24px)]",
        className,
      )}
    >
      {label ? (
        <span className="absolute bottom-2.5 left-3 font-mono text-[9.5px] text-escuro/45">
          [ {label} ]
        </span>
      ) : null}
    </div>
  );
}
