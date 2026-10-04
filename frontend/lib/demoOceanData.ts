export const DEMO_OCEAN_DATA = {
  location: {
    lat: 12.4,
    lon: 78.2,
  },

  timestamp: "2022-06-15T12:00:00",

  sst: {
    value: 28.42,
    unit: "°C",
    min: 27.91,
    max: 28.76,
    label: "Sea Surface Temperature",
    shortLabel: "SST",
    description: "Surface thermal state of the ocean",
  },

  sss: {
    value: 34.72,
    unit: "PSU",
    min: 34.31,
    max: 35.08,
    label: "Sea Surface Salinity",
    shortLabel: "SSS",
    description: "Surface salinity concentration",
  },

  ssh: {
    value: 0.42,
    unit: "m",
    sla: 0.08,
    slaUnit: "m",
    min: 0.18,
    max: 0.67,
    label: "Sea Surface Height",
    shortLabel: "SSH / SLA",
    description: "Surface height and sea-level anomaly",
  },

  currents: {
    u: 0.31,
    v: -0.14,
    speed: 0.34,
    unit: "m/s",
    label: "Surface Ocean Currents",
    shortLabel: "U / V",
    description: "Surface current velocity components",
  },

  winds: {
    u: 4.82,
    v: -2.17,
    speed: 5.29,
    unit: "m/s",
    label: "Surface Winds",
    shortLabel: "U / V",
    description: "Surface wind velocity components",
  },
} as const;

export type OceanVariable =
  | "sst"
  | "sss"
  | "ssh"
  | "currents"
  | "winds";