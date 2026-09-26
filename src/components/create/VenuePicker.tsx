/**
 * `VenuePicker` — step 4, S-C4, specified in `docs/ux/01-campaign-flows.md` §9 and §12.5.
 *
 * Why a new component: the existing control is two inline buttons setting a boolean `irl`, which
 * cannot express "Twitch with a Kick simulcast" or say which stable identifier is being hashed
 * (§11.3).
 *
 * What is hashed is stated on the screen (§9.1: "What you type is what gets hashed"), and the
 * hash is `keccak256(utf8(normaliseVenueRef(value)))` — see `normaliseVenueRef` in
 * `src/helper/AgoraHelper.ts`. Nothing is sent on chain from this component: the builder holds the
 * draft and `createDiscussion` writes `venueKind` + `venueRefHash` at signing time.
 *
 * The attestation level shown for each venue is the venue's *ceiling*. Whether it is reached is
 * decided off-chain by the attestation service, so the state here is always `Declared` and the
 * copy says so — `venue.resolve.declaredOnly`.
 */

import { useState } from "react";
import { VENUE_IRL, VENUE_DECLARED_ONLY, VENUE_NORMALISATION_HELPER, VENUES, normaliseVenueRef } from "../../helper/AgoraHelper";
import { VenueDraft } from "../../lib/agoraDraft";

export interface VenuePickerProps {
    venue: VenueDraft;
    onChange: (venue: VenueDraft) => void;
    error: string | null;
}

const CEILING_LABEL: Record<string, string> = {
    declared: "Declared",
    handleLinked: "Handle linked",
    observed: "Verified live",
    verifiedLive: "Verified live",
};

const IRL_FIELDS = ["name", "address", "city", "state", "country", "zip"] as const;
const IRL_LABEL: Record<(typeof IRL_FIELDS)[number], string> = {
    name: "Venue name",
    address: "Address",
    city: "City",
    state: "State",
    country: "Country",
    zip: "Postal code",
};

export const VenuePicker = ({ venue, onChange, error }: VenuePickerProps) => {
    const [irlParts, setIrlParts] = useState<Record<string, string>>({});

    const selected = VENUES.find((v) => v.kind === venue.kind) ?? null;

    const commitIrl = (next: Record<string, string>) => {
        setIrlParts(next);
        const reference = IRL_FIELDS.filter((field) => next[field]?.trim()).map((field) => `${field}:${next[field]!.trim()}`).join(", ");
        onChange({ kind: venue.kind, reference });
    };

    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-[#E5F7FFE5] font-Lexend font-semibold text-xs uppercase tracking-wide">
                WHERE DOES IT HAPPEN?
            </h3>

            <div className="flex flex-wrap gap-2">
                {VENUES.map((spec) => (
                    <button
                        key={spec.kind}
                        type="button"
                        aria-pressed={venue.kind === spec.kind}
                        onClick={() => onChange({ kind: spec.kind, reference: spec.kind === VENUE_IRL ? venue.reference : venue.reference })}
                        className={`${
                            venue.kind === spec.kind ? "button-i-f-e" : "button-i-f"
                        } px-3 py-2 font-Lexend text-[10px] uppercase tracking-wide text-[#E5F7FF] focus-visible:ring-2 focus-visible:ring-[#84B9D1]`}>
                        {spec.label}
                    </button>
                ))}
            </div>

            {selected === null ? (
                <p className="text-[#FBED96] font-Lexend text-xs">Pick where this discussion happens.</p>
            ) : (
                <div className="flex flex-col gap-3 max-w-[585px]">
                    {selected.kind === VENUE_IRL ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {IRL_FIELDS.map((field) => (
                                <div key={field} className="flex flex-col gap-1">
                                    <label
                                        htmlFor={`venue-${field}`}
                                        className="text-[10px] text-[#E5F7FFE5] font-semibold font-Lexend uppercase tracking-wide">
                                        {IRL_LABEL[field]}
                                    </label>
                                    <input
                                        id={`venue-${field}`}
                                        value={irlParts[field] ?? ""}
                                        onChange={(event) => commitIrl({ ...irlParts, [field]: event.target.value })}
                                        className="input-s text-white/80 text-xs"
                                        type="text"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            <label
                                htmlFor="venue-reference"
                                className="text-[10px] text-[#E5F7FFE5] font-semibold font-Lexend uppercase tracking-wide">
                                {selected.fieldLabel}
                            </label>
                            <input
                                id="venue-reference"
                                value={venue.reference}
                                onChange={(event) => onChange({ kind: venue.kind, reference: event.target.value })}
                                className="input-s text-white/80 text-xs"
                                type="text"
                                aria-invalid={Boolean(error)}
                            />
                        </div>
                    )}

                    <p className="text-[#7D8B92] font-Lexend text-xs leading-5">{selected.helper}</p>

                    {selected.kind !== VENUE_IRL ? (
                        <p className="text-[#7D8B92] font-Lexend text-xs leading-5">{VENUE_NORMALISATION_HELPER}</p>
                    ) : null}

                    <div className="flex items-center gap-2">
                        <span className="button-o font-Lexend text-[10px] uppercase tracking-wide text-[#7D8B92]">
                            {CEILING_LABEL[selected.ceiling] ?? "Declared"}
                        </span>
                        <span className="font-Lexend text-xs text-[#7D8B92]">{VENUE_DECLARED_ONLY}</span>
                    </div>

                    {venue.reference ? (
                        <p className="font-Lexend text-xs text-[#7D8B92] break-all">
                            Hashed as <span className="text-[#E5F7FF]">{normaliseVenueRef(venue.reference) || "—"}</span>
                        </p>
                    ) : null}

                    {error ? (
                        <p className="text-[#FC8181] font-Lexend text-xs" role="alert">
                            {error}
                        </p>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default VenuePicker;
