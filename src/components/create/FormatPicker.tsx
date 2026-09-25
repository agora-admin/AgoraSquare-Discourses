/**
 * `FormatPicker` — step 1, S-C1 in `docs/ux/01-campaign-flows.md` §3.1 and the copy in §12.2.
 *
 * Why a new component: the existing "type of event" control is two inline buttons inside
 * `create.tsx` with no description, no count and no state model (`docs/ux/01` §11.3), and
 * `create.tsx` must stay diff-stable.
 *
 * The live-count line the spec allows ("1 of 5 formats is live on this chain") is deliberately
 * absent: it needs the indexer, and the spec's own error state says "cards render with the
 * live-count line omitted rather than an error" — so the line is simply never drawn.
 */

import { FORMATS, FormatSpec } from "../../helper/AgoraHelper";

const formatDisabledReason = "Pick a format to continue.";

export interface FormatPickerProps {
    /** KIND_* or null before anything is chosen */
    selected: number | null;
    onSelect: (kind: number) => void;
    /** the format change confirmation (§3.7) is owned by the builder */
}

export const FormatPicker = ({ selected, onSelect }: FormatPickerProps) => (
    <div className="flex flex-col gap-4">
        <h3 className="text-[#E5F7FFE5] font-Lexend font-semibold text-xs uppercase tracking-wide">
            HOW SHOULD THIS DISCUSSION RUN?
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md2:grid-cols-3 gap-3">
            {FORMATS.map((spec: FormatSpec) => {
                const isSelected = selected === spec.kind;
                return (
                    <button
                        key={spec.kind}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => onSelect(spec.kind)}
                        className={`btn-hvr text-left bg-card rounded-xl p-4 flex flex-col gap-2 t-all focus-visible:ring-2 focus-visible:ring-[#84B9D1] ${
                            isSelected ? "border-[#84B9D1]" : ""
                        }`}>
                        <span className="font-Lexend font-semibold text-sm text-[#E5F7FF]">{spec.title}</span>
                        <span className="font-Lexend text-xs text-[#7D8B92] leading-5">{spec.body}</span>
                    </button>
                );
            })}
        </div>

        <p className="text-[#7D8B92] font-Lexend text-xs">
            Not sure? A debate is the safest first campaign.
            {selected === null ? <span className="text-[#FBED96]"> {formatDisabledReason}</span> : null}
        </p>
    </div>
);

export default FormatPicker;
