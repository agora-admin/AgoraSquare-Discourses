/**
 * The six reaction glyphs — `docs/ux/02` §9.4 (silhouettes), §9.5 (keys) and §9.8 device 7.
 *
 * One component with a taxonomy prop, so the six stay consistent and the file mirrors
 * `SvgHub.tsx`'s own convention. None of the six is a face, a hand, a heart, a star or a
 * number: the rule in §9.8 is that nothing in the visible set may carry a
 * platform-interpreted valenced meaning.
 *
 * These should be appended to `src/components/utils/SvgHub.tsx` at delivery (`ReactEvidenceIcon`
 * … `ReactOfftopicIcon`, per `docs/ux/02` §12.2). They are here rather than there because
 * `SvgHub.tsx` is shared by screens this slice does not own.
 */

import { TaxonomyId } from "../../helper/AgoraHelper";

export const REACTION_GLYPH_PATHS: Record<TaxonomyId, JSX.Element> = {
    0: (
        <>
            <path d="M2 1.4h6.2v5.4H6.4L4.2 9.4V6.8H2z" strokeWidth="1.1" />
            <path d="M8.4 3.6v1.1M9 3.6v1.1M9.6 3.6v1.1" strokeWidth="1.1" strokeLinecap="round" />
        </>
    ),
    1: (
        <>
            <path d="M1.6 2.4 6.6 8M1.6 13.6 6.6 8" strokeWidth="1.1" strokeLinecap="round" />
            <path d="M14.4 2.4 9.4 8M14.4 13.6 9.4 8" strokeWidth="1.1" strokeLinecap="round" />
        </>
    ),
    2: (
        <>
            <path d="M2.4 3.4h11.2M2.4 8h11.2M2.4 12.6h11.2" strokeWidth="1.1" strokeLinecap="round" />
        </>
    ),
    3: (
        <>
            <path d="M8 1.8a6.2 6.2 0 1 0 5.4 9.2" strokeWidth="1.1" strokeLinecap="round" />
            <circle cx="8" cy="8" r="1.3" strokeWidth="1.1" />
        </>
    ),
    4: (
        <>
            <path d="M1.6 8 6.6 3.4M1.6 8l5 4.6" strokeWidth="1.1" strokeLinecap="round" />
            <path d="M14.4 8 9.4 3.4M14.4 8l-5 4.6" strokeWidth="1.1" strokeLinecap="round" />
        </>
    ),
    5: (
        <>
            <rect x="1.8" y="2.2" width="12.4" height="11.6" rx="1.4" strokeWidth="1.1" />
            <path d="M8.6 8h5.4M11 5.8 13.4 8 11 10.2" strokeWidth="1.1" strokeLinecap="round" />
        </>
    ),
};

export const ReactionGlyph = ({
    taxonomyId,
    size = 16,
    color,
}: {
    taxonomyId: TaxonomyId;
    size?: number;
    /** defaults to the taxonomy's own colour; pass a token to override */
    color?: string;
}) => {
    const stroke = color;
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 16 16"
            fill="none"
            stroke={stroke ?? "currentColor"}
            strokeLinejoin="round"
            aria-hidden="true">
            {REACTION_GLYPH_PATHS[taxonomyId]}
        </svg>
    );
};

export default ReactionGlyph;
