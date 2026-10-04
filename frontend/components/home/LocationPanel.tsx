"use client";

import {
  Activity,
  Loader2,
  MapPin,
  Search,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";

import type { OceanArea } from "@/components/map/OceanMap";
import type { SelectionMode } from "@/hooks/useOceanExplorer";

interface LocationPanelProps {
  mode: SelectionMode;
  selectedArea: OceanArea;
  onLocationChange: (lat: number, lon: number) => void;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

export default function LocationPanel({
  mode,
  selectedArea,
  onLocationChange,
}: LocationPanelProps) {
  const [query, setQuery] = useState("");

  const [isSearching, setIsSearching] =
    useState(false);

  const [searchError, setSearchError] =
    useState<string | null>(null);

  const [latitude, setLatitude] = useState(
    selectedArea.centerLat.toFixed(4),
  );

  const [longitude, setLongitude] = useState(
    selectedArea.centerLon.toFixed(4),
  );

  /*
   * Keep the manual coordinate inputs synchronized
   * whenever the location changes from the map,
   * search, or another source.
   */
  useEffect(() => {
    setLatitude(
      selectedArea.centerLat.toFixed(4),
    );

    setLongitude(
      selectedArea.centerLon.toFixed(4),
    );
  }, [
    selectedArea.centerLat,
    selectedArea.centerLon,
  ]);

  /*
   * Search a location using OpenStreetMap Nominatim.
   */
  async function handleSearch() {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setSearchError(
        "Enter a location to search.",
      );
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(
          trimmedQuery,
        )}`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          "Location search is currently unavailable.",
        );
      }

      const results =
        (await response.json()) as NominatimResult[];

      if (!results.length) {
        setSearchError(
          "No matching location was found.",
        );
        return;
      }

      const lat = Number(results[0].lat);
      const lon = Number(results[0].lon);

      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lon)
      ) {
        setSearchError(
          "The location returned invalid coordinates.",
        );
        return;
      }

      setLatitude(lat.toFixed(4));
      setLongitude(lon.toFixed(4));

      onLocationChange(lat, lon);
    } catch (error) {
      console.error(
        "Location search failed:",
        error,
      );

      setSearchError(
        error instanceof Error
          ? error.message
          : "Unable to search for this location.",
      );
    } finally {
      setIsSearching(false);
    }
  }

  /*
   * Search when pressing Enter.
   */
  function handleSearchKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleSearch();
    }
  }

  /*
   * Move the map to manually entered coordinates.
   */
  function handleManualCoordinates() {
    const lat = Number(latitude);
    const lon = Number(longitude);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon)
    ) {
      setSearchError(
        "Please enter valid latitude and longitude values.",
      );
      return;
    }

    if (lat < -90 || lat > 90) {
      setSearchError(
        "Latitude must be between -90 and 90.",
      );
      return;
    }

    if (lon < -180 || lon > 180) {
      setSearchError(
        "Longitude must be between -180 and 180.",
      );
      return;
    }

    setSearchError(null);

    setLatitude(lat.toFixed(4));
    setLongitude(lon.toFixed(4));

    onLocationChange(lat, lon);
  }

  return (
    <div className="space-y-4">

      {/* LOCATION HEADER */}
      <div className="flex items-center gap-2">
        <MapPin
          size={13}
          className="text-[#02ABD5]"
        />

        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#4F7E95]">
          Location
        </p>
      </div>

      {/* SEARCH LOCATION */}
      <div>
        <label
          htmlFor="ocean-location-search"
          className="mb-2 block text-[10px] font-semibold text-[#07516D]"
        >
          Search location
        </label>

        <div className="relative">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#78A4B5]"
          />

          <input
            id="ocean-location-search"
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSearchError(null);
            }}
            onKeyDown={handleSearchKeyDown}
            placeholder="e.g. Kolkata"
            className="h-10 w-full rounded-[11px] border border-[#CFEAF1] bg-white pl-9 pr-10 text-[11px] font-medium text-[#07516D] outline-none transition placeholder:text-[#9AB7C3] focus:border-[#02ABD5] focus:ring-2 focus:ring-[#02ABD5]/10"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSearchError(null);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8AAAB7] transition hover:text-[#07516D]"
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => void handleSearch()}
          disabled={isSearching}
          className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-[10px] bg-[#07516D] text-[10px] font-bold text-white transition hover:bg-[#063B4D] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSearching ? (
            <>
              <Loader2
                size={13}
                className="animate-spin"
              />

              Searching...
            </>
          ) : (
            <>
              <Search size={13} />

              Search location
            </>
          )}
        </button>
      </div>

      {/* MANUAL COORDINATES */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-[10px] font-semibold text-[#07516D]">
            Coordinates
          </label>

          <span className="text-[8px] font-medium text-[#78A4B5]">
            Manual input
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">

          {/* LATITUDE */}
          <div>
            <label
              htmlFor="ocean-latitude"
              className="mb-1 block text-[8px] font-bold uppercase tracking-[0.12em] text-[#6D98A9]"
            >
              Latitude
            </label>

            <input
              id="ocean-latitude"
              type="number"
              step="any"
              value={latitude}
              onChange={(event) => {
                setLatitude(event.target.value);
                setSearchError(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleManualCoordinates();
                }
              }}
              className="h-10 w-full rounded-[10px] border border-[#CFEAF1] bg-white px-3 text-[11px] font-semibold text-[#07516D] outline-none transition focus:border-[#02ABD5] focus:ring-2 focus:ring-[#02ABD5]/10"
            />
          </div>

          {/* LONGITUDE */}
          <div>
            <label
              htmlFor="ocean-longitude"
              className="mb-1 block text-[8px] font-bold uppercase tracking-[0.12em] text-[#6D98A9]"
            >
              Longitude
            </label>

            <input
              id="ocean-longitude"
              type="number"
              step="any"
              value={longitude}
              onChange={(event) => {
                setLongitude(event.target.value);
                setSearchError(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleManualCoordinates();
                }
              }}
              className="h-10 w-full rounded-[10px] border border-[#CFEAF1] bg-white px-3 text-[11px] font-semibold text-[#07516D] outline-none transition focus:border-[#02ABD5] focus:ring-2 focus:ring-[#02ABD5]/10"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleManualCoordinates}
          className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-[10px] border border-[#BFE5ED] bg-[#F2FBFD] text-[10px] font-bold text-[#07516D] transition hover:border-[#02ABD5] hover:bg-[#E7F8FB]"
        >
          <MapPin size={13} />

          Go to coordinates
        </button>
      </div>

      {/* ERROR */}
      {searchError && (
        <p className="rounded-[9px] border border-red-100 bg-red-50 px-3 py-2 text-[9px] font-medium leading-[1.4] text-red-600">
          {searchError}
        </p>
      )}

      {/* REPRESENTATIVE POINT */}
      <div className="rounded-[12px] border border-[#D7EEF3] bg-[#F7FCFD] p-3">
        <div className="mb-2 flex items-center gap-2">
          <Activity
            size={12}
            className="text-[#02ABD5]"
          />

          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#4F7E95]">
            Representative point
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">

          <div>
            <p className="text-[8px] uppercase tracking-[0.1em] text-[#7EA3B0]">
              Latitude
            </p>

            <p className="mt-0.5 text-[12px] font-bold text-[#07516D]">
              {selectedArea.centerLat.toFixed(4)}°
            </p>
          </div>

          <div>
            <p className="text-[8px] uppercase tracking-[0.1em] text-[#7EA3B0]">
              Longitude
            </p>

            <p className="mt-0.5 text-[12px] font-bold text-[#07516D]">
              {selectedArea.centerLon.toFixed(4)}°
            </p>
          </div>

        </div>
      </div>

      {/* AREA INFORMATION */}
      {mode === "area" && (
        <div className="rounded-[12px] border border-[#D7EEF3] bg-[#F7FCFD] p-3">

          <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#4F7E95]">
            Selected area
          </p>

          <div className="grid grid-cols-2 gap-x-3 gap-y-2">

            <div>
              <p className="text-[8px] text-[#7EA3B0]">
                North
              </p>

              <p className="text-[10px] font-semibold text-[#07516D]">
                {selectedArea.north.toFixed(2)}°
              </p>
            </div>

            <div>
              <p className="text-[8px] text-[#7EA3B0]">
                South
              </p>

              <p className="text-[10px] font-semibold text-[#07516D]">
                {selectedArea.south.toFixed(2)}°
              </p>
            </div>

            <div>
              <p className="text-[8px] text-[#7EA3B0]">
                East
              </p>

              <p className="text-[10px] font-semibold text-[#07516D]">
                {selectedArea.east.toFixed(2)}°
              </p>
            </div>

            <div>
              <p className="text-[8px] text-[#7EA3B0]">
                West
              </p>

              <p className="text-[10px] font-semibold text-[#07516D]">
                {selectedArea.west.toFixed(2)}°
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}