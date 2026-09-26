import { Info, Search } from "lucide-react";
import { getFieldError } from "@/client/lib/forms";
import {
  isResultLimit,
  normalizeKeywordMode,
} from "@/client/features/keywords/keywordSearchParams";
import {
  MAX_KEYWORDS_PER_SUBMIT,
  RESULT_LIMITS,
} from "@/client/features/keywords/keywordResearchTypes";
import { isLabsLocationCode } from "@/client/features/keywords/locations";
import { LocationSelect } from "@/client/components/LocationSelect";
import type { KeywordResearchControllerState } from "./types";

type Props = {
  controller: KeywordResearchControllerState;
};

function getTextareaRows(value: string): number {
  const newlines = (value.match(/\n/g) ?? []).length;
  const lines = newlines + 1;
  return Math.min(MAX_KEYWORDS_PER_SUBMIT, Math.max(1, lines));
}

export function KeywordResearchSearchBar({ controller }: Props) {
  const { controlsForm, handleSearchSubmit } = controller;

  return (
    <div className="overflow-hidden rounded-2xl border border-base-300/80 bg-base-100 shadow-2xs">
      <div className="p-4 sm:p-5 md:p-6 space-y-4">
        <form
          className="flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-3"
          onSubmit={handleSearchSubmit}
        >
          <controlsForm.Field name="keyword">
            {(field) => {
              const keywordError = getFieldError(field.state.meta.errors);
              const rows = getTextareaRows(field.state.value);

              return (
                <label
                  className={`flex w-full lg:flex-1 lg:min-w-[260px] items-start gap-2.5 rounded-xl border bg-base-100 px-3.5 py-2.5 sm:px-4 sm:py-3 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 ${
                    keywordError ? "border-error" : "border-base-300"
                  }`}
                >
                  <Search className="mt-0.5 sm:mt-1 size-4 shrink-0 text-base-content/60" />
                  <textarea
                    className="grow min-w-0 resize-none bg-transparent text-sm leading-6 outline-none placeholder:text-base-content/40"
                    rows={rows}
                    placeholder="Enter a keyword"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void controlsForm.handleSubmit();
                      }
                    }}
                  />
                </label>
              );
            }}
          </controlsForm.Field>

          <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:items-center sm:gap-2.5 shrink-0">
            <controlsForm.Field name="locationCode">
              {(field) => (
                <LocationSelect
                  value={field.state.value}
                  onChange={(code) => field.handleChange(code)}
                  className="w-full sm:w-44 shrink-0"
                />
              )}
            </controlsForm.Field>

            <controlsForm.Field name="resultLimit">
              {(field) => (
                <select
                  className="select select-bordered w-full sm:w-auto shrink-0 rounded-xl font-medium text-xs sm:text-sm"
                  value={field.state.value}
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    field.handleChange(isResultLimit(next) ? next : 150);
                  }}
                >
                  {RESULT_LIMITS.map((limit) => (
                    <option key={limit} value={limit}>
                      {limit} results
                    </option>
                  ))}
                </select>
              )}
            </controlsForm.Field>

            <controlsForm.Field name="mode">
              {(field) => (
                <select
                  className="select select-bordered w-full sm:w-auto shrink-0 rounded-xl font-medium text-xs sm:text-sm"
                  value={field.state.value}
                  onChange={(event) =>
                    field.handleChange(normalizeKeywordMode(event.target.value))
                  }
                >
                  <option value="auto">Auto</option>
                  <option value="related">Related keywords</option>
                  <option value="suggestions">Suggestions</option>
                  <option value="ideas">Ideas</option>
                </select>
              )}
            </controlsForm.Field>

            <button
              type="submit"
              className="btn btn-primary rounded-xl font-semibold shadow-xs w-full px-6 sm:w-auto shrink-0 col-span-2 sm:col-span-1"
            >
              Search
            </button>
          </div>
        </form>

        <controlsForm.Field name="keyword">
          {(field) => {
            const keywordError = getFieldError(field.state.meta.errors);

            return keywordError ? (
              <p className="text-xs sm:text-sm text-error">{keywordError}</p>
            ) : null;
          }}
        </controlsForm.Field>

        <controlsForm.Field name="locationCode">
          {(locationField) =>
            isLabsLocationCode(locationField.state.value) ? (
              <controlsForm.Field name="clickstream">
                {(field) => (
                  <div className="pt-3.5 border-t border-base-200/80 flex items-center justify-between">
                    <label className="label cursor-pointer justify-start gap-2.5 p-0">
                      <input
                        type="checkbox"
                        className="toggle toggle-sm toggle-primary"
                        checked={field.state.value}
                        onChange={(event) =>
                          field.handleChange(event.target.checked)
                        }
                      />
                      <span className="text-xs sm:text-sm font-medium text-base-content/80">
                        Clickstream-refined volumes
                      </span>
                    </label>
                    <div
                      className="tooltip tooltip-left"
                      data-tip="Google reports one combined search volume for similar keywords (e.g. 'seo tool' and 'seo tools'). Turn this on to estimate each keyword's own volume. Costs 2x the credits."
                    >
                      <Info className="size-3.5 text-base-content/40 cursor-help" />
                    </div>
                  </div>
                )}
              </controlsForm.Field>
            ) : (
              <div
                className="mt-3.5 flex items-start gap-2 rounded-xl border border-info/30 bg-info/10 p-3 text-xs text-base-content/80"
                role="status"
              >
                <Info className="mt-0.5 size-4 shrink-0 text-info" />
                <span>
                  Keyword data for this country comes from Google Ads — search
                  volume, CPC, and trends are available, but difficulty and
                  intent are not.
                </span>
              </div>
            )
          }
        </controlsForm.Field>
      </div>
    </div>
  );
}
