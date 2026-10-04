"use client";

import {
  MapContainer,
  TileLayer,
  Rectangle,
  CircleMarker,
  useMap,
  useMapEvents,
} from "react-leaflet";

import { useEffect, useRef } from "react";

import type { LeafletMouseEvent } from "leaflet";

export interface OceanArea {
  north: number;
  south: number;
  east: number;
  west: number;
  centerLat: number;
  centerLon: number;
}

interface OceanMapProps {
  mode: "entire" | "area" | "point";
  selectedArea: OceanArea;
  onAreaChange: (area: OceanArea) => void;
  onPointChange: (lat: number, lon: number) => void;
  searchLocation: {
    lat: number;
    lon: number;
  } | null;
}

/* -------------------------------------------------------
   CREATE AREA

   No geographic restrictions.
   The user can select an area anywhere in the world.
------------------------------------------------------- */

function createArea(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): OceanArea {
  const south = Math.min(lat1, lat2);
  const north = Math.max(lat1, lat2);
  const west = Math.min(lon1, lon2);
  const east = Math.max(lon1, lon2);

  return {
    north,
    south,
    east,
    west,
    centerLat: (north + south) / 2,
    centerLon: (east + west) / 2,
  };
}

/* -------------------------------------------------------
   INTRO CAMERA ANIMATION

   Starts with a wider global view and smoothly moves
   toward the North Indian Ocean.

   The map remains completely global and unrestricted
   after the animation.
------------------------------------------------------- */

function OceanIntroAnimation() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    // Start in a wider global view.
    map.setView([20, 20], 2, {
      animate: false,
    });

    // Small delay lets the map render before the
    // camera animation begins.
    const introTimer = window.setTimeout(() => {
      container.classList.add("ocean-map-intro-active");

      map.flyTo([17.5, 75], 3, {
        duration: 2.2,
        easeLinearity: 0.25,
      });

      // Remove the intro class after the camera
      // animation has completed.
      const finishTimer = window.setTimeout(() => {
        container.classList.remove(
          "ocean-map-intro-active",
        );

        container.classList.add(
          "ocean-map-intro-complete",
        );

        // Remove the class after the fade settles.
        window.setTimeout(() => {
          container.classList.remove(
            "ocean-map-intro-complete",
          );
        }, 500);
      }, 2300);

      return () => {
        window.clearTimeout(finishTimer);
      };
    }, 250);

    return () => {
      window.clearTimeout(introTimer);
    };
  }, [map]);

  return null;
}

/* -------------------------------------------------------
   SEARCH LOCATION CONTROLLER

   Receives coordinates from the LocationPanel and:

   1. Flies the map toward the location.
   2. Zooms in so the location is clearly visible.

   The selected point itself is controlled by the parent
   state through selectedArea.
------------------------------------------------------- */

function SearchLocationController({
  searchLocation,
}: {
  searchLocation: {
    lat: number;
    lon: number;
  } | null;
}) {
  const map = useMap();

  const previousLocation = useRef<{
    lat: number;
    lon: number;
  } | null>(null);

  useEffect(() => {
    if (!searchLocation) {
      return;
    }

    const { lat, lon } = searchLocation;

    // Prevent the map from flying again if the same
    // coordinates are passed more than once.
    if (
      previousLocation.current?.lat === lat &&
      previousLocation.current?.lon === lon
    ) {
      return;
    }

    previousLocation.current = {
      lat,
      lon,
    };

    map.flyTo(
      [lat, lon],
      6,
      {
        duration: 1.8,
        easeLinearity: 0.25,
      },
    );
  }, [map, searchLocation]);

  return null;
}

/* -------------------------------------------------------
   MAP CURSOR CONTROLLER

   Changes cursor depending on the active interaction
   mode.
------------------------------------------------------- */

function MapCursorController({
  mode,
}: {
  mode: "entire" | "area" | "point";
}) {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    container.classList.remove(
      "cursor-ocean",
      "cursor-area",
      "cursor-point",
      "is-drawing-area",
    );

    if (mode === "area") {
      container.classList.add("cursor-area");
    } else if (mode === "point") {
      container.classList.add("cursor-point");
    } else {
      container.classList.add("cursor-ocean");
    }

    return () => {
      container.classList.remove(
        "cursor-ocean",
        "cursor-area",
        "cursor-point",
        "is-drawing-area",
      );
    };
  }, [map, mode]);

  return null;
}

/* -------------------------------------------------------
   POINT SELECTOR

   Click anywhere on the world map.
------------------------------------------------------- */

function PointSelector({
  mode,
  onPointChange,
}: {
  mode: "entire" | "area" | "point";
  onPointChange: (lat: number, lon: number) => void;
}) {
  useMapEvents({
    click(event: LeafletMouseEvent) {
      if (mode !== "point") {
        return;
      }

      onPointChange(
        event.latlng.lat,
        event.latlng.lng,
      );
    },
  });

  return null;
}

/* -------------------------------------------------------
   AREA / SNIPPING SELECTOR

   Drag anywhere on the world map.
------------------------------------------------------- */

function AreaSelector({
  mode,
  onAreaChange,
}: {
  mode: "entire" | "area" | "point";
  onAreaChange: (area: OceanArea) => void;
}) {
  const map = useMap();

  useMapEvents({
    mousedown(event: LeafletMouseEvent) {
      if (mode !== "area") {
        return;
      }

      if (event.originalEvent.button !== 0) {
        return;
      }

      const startLat = event.latlng.lat;
      const startLon = event.latlng.lng;

      let drawing = true;

      const container = map.getContainer();

      /* ---------------------------------------------
         Disable normal map panning while selecting
         an area.
      --------------------------------------------- */

      map.dragging.disable();

      container.classList.add("is-drawing-area");

      /* ---------------------------------------------
         Mouse movement while drawing
      --------------------------------------------- */

      const handleMouseMove = (
        moveEvent: LeafletMouseEvent,
      ) => {
        if (!drawing) {
          return;
        }

        const area = createArea(
          startLat,
          startLon,
          moveEvent.latlng.lat,
          moveEvent.latlng.lng,
        );

        onAreaChange(area);
      };

      /* ---------------------------------------------
         Mouse release
      --------------------------------------------- */

      const handleMouseUp = (
        upEvent: LeafletMouseEvent,
      ) => {
        if (!drawing) {
          return;
        }

        drawing = false;

        const area = createArea(
          startLat,
          startLon,
          upEvent.latlng.lat,
          upEvent.latlng.lng,
        );

        onAreaChange(area);

        /* -----------------------------------------
           Restore normal map behavior
        ----------------------------------------- */

        map.dragging.enable();

        container.classList.remove(
          "is-drawing-area",
        );

        map.off(
          "mousemove",
          handleMouseMove,
        );

        map.off(
          "mouseup",
          handleMouseUp,
        );
      };

      /* ---------------------------------------------
         Register temporary drawing listeners
      --------------------------------------------- */

      map.on(
        "mousemove",
        handleMouseMove,
      );

      map.on(
        "mouseup",
        handleMouseUp,
      );
    },
  });

  /* ---------------------------------------------
     Safety cleanup
  --------------------------------------------- */

  useEffect(() => {
    return () => {
      const container = map.getContainer();

      map.dragging.enable();

      container.classList.remove(
        "is-drawing-area",
      );
    };
  }, [map]);

  return null;
}

/* -------------------------------------------------------
   MAIN WORLD MAP
------------------------------------------------------- */

export default function OceanMap({
  mode,
  selectedArea,
  onAreaChange,
  onPointChange,
  searchLocation,
}: OceanMapProps) {
  return (
    <MapContainer
      /*
       * Initial camera position.
       *
       * OceanIntroAnimation immediately changes this
       * to a wider global view and then flies toward
       * the North Indian Ocean.
       *
       * There are NO maxBounds.
       * The entire world remains navigable.
       */
      center={[17.5, 75]}
      zoom={3}
      minZoom={2}
      maxZoom={18}
      worldCopyJump={true}
      scrollWheelZoom={true}
      className="ocean-map-container h-full w-full"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* ---------------------------------------------
          INTRO CAMERA
      --------------------------------------------- */}

      <OceanIntroAnimation />

      {/* ---------------------------------------------
          SEARCH LOCATION
      --------------------------------------------- */}

      <SearchLocationController
        searchLocation={searchLocation}
      />

      {/* ---------------------------------------------
          CURSOR CONTROLLER
      --------------------------------------------- */}

      <MapCursorController mode={mode} />

      {/* ---------------------------------------------
          POINT SELECTION
      --------------------------------------------- */}

      <PointSelector
        mode={mode}
        onPointChange={onPointChange}
      />

      {/* ---------------------------------------------
          AREA SELECTION
      --------------------------------------------- */}

      <AreaSelector
        mode={mode}
        onAreaChange={onAreaChange}
      />

      {/* ---------------------------------------------
          SELECTED AREA
      --------------------------------------------- */}

      {mode === "area" && (
        <Rectangle
          bounds={[
            [
              selectedArea.south,
              selectedArea.west,
            ],
            [
              selectedArea.north,
              selectedArea.east,
            ],
          ]}
          pathOptions={{
            color: "#06313F",
            weight: 3,
            opacity: 1,
            fillColor: "#0E7C92",
            fillOpacity: 0.18,
            dashArray: "8 6",
          }}
        />
      )}

      {/* ---------------------------------------------
          SELECTED POINT
      --------------------------------------------- */}

      {mode === "point" && (
        <>
          {/* Outer glow */}

          <CircleMarker
            center={[
              selectedArea.centerLat,
              selectedArea.centerLon,
            ]}
            radius={18}
            pathOptions={{
              color: "#0E7C92",
              weight: 2,
              opacity: 0.3,
              fillOpacity: 0,
            }}
          />

          {/* Secondary ring */}

          <CircleMarker
            center={[
              selectedArea.centerLat,
              selectedArea.centerLon,
            ]}
            radius={12}
            pathOptions={{
              color: "#0E7C92",
              weight: 1,
              opacity: 0.45,
              fillOpacity: 0,
            }}
          />

          {/* Actual selected point */}

          <CircleMarker
            center={[
              selectedArea.centerLat,
              selectedArea.centerLon,
            ]}
            radius={8}
            pathOptions={{
              color: "#ffffff",
              weight: 3,
              fillColor: "#0E7C92",
              fillOpacity: 1,
            }}
          />
        </>
      )}

      {/* ---------------------------------------------
          AREA CENTER

          The backend currently works with a
          representative point, so the center of the
          selected rectangle is shown.
      --------------------------------------------- */}

      {mode === "area" && (
        <CircleMarker
          center={[
            selectedArea.centerLat,
            selectedArea.centerLon,
          ]}
          radius={7}
          pathOptions={{
            color: "#ffffff",
            weight: 3,
            fillColor: "#0E7C92",
            fillOpacity: 1,
          }}
        />
      )}
    </MapContainer>
  );
}