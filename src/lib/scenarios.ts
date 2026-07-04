import cycloneA from "@/assets/cyclone-a.jpg";
import cycloneMid from "@/assets/cyclone-mid.jpg";
import cycloneB from "@/assets/cyclone-b.jpg";

import floodA from "@/assets/flood-a.jpg";
import floodMid from "@/assets/flood-mid.jpg";
import floodB from "@/assets/flood-b.jpg";

import fireA from "@/assets/fire-a.jpg";
import fireMid from "@/assets/fire-mid.jpg";
import fireB from "@/assets/fire-b.jpg";

import dustA from "@/assets/cylones-a.jpg";
import dustMid from "@/assets/cylones-mid.jpg";
import dustB from "@/assets/cylones-b.jpg";

import urbanA from "@/assets/land-a.jpg";
import urbanMid from "@/assets/land-mid.jpg";
import urbanB from "@/assets/land-b.jpg";

export type Scenario = {
  id: string;
  name: string;
  description: string;
  region: string;
  sensor: string;
  imageType: "Visible" | "Thermal IR";
  frameA: string;
  frameB: string;
  frameMid: string;
  t0: string;
  t1: string;
  tmid: string;
  spatial: string;
  event: string;
};

export const scenarios: Scenario[] = [
  {
    id: "cyclone",
    name: "Cyclone",
    description: "Track the evolution of a tropical cyclone over open ocean.",
    region: "North Atlantic Ocean",
    sensor: "GOES-16 ABI",
    imageType: "Visible",
    frameA: cycloneA,
    frameMid: cycloneMid,
    frameB: cycloneB,
    t0: "2024-05-12 06:00 UTC",
    t1: "2024-05-12 08:00 UTC",
    tmid: "2024-05-12 07:00 UTC",
    spatial: "1 km",
    event: "Tropical Cyclone",
  },
  {
    id: "flood",
    name: "Flood Mapping",
    description: "Monitor flood extent changes across river basins and lowlands.",
    region: "Indo-Gangetic Plain",
    sensor: "INSAT-3DR",
    imageType: "Visible",
    frameA: floodA,
    frameMid: floodMid,
    frameB: floodB,
    t0: "2024-07-18 03:00 UTC",
    t1: "2024-07-18 06:00 UTC",
    tmid: "2024-07-18 04:30 UTC",
    spatial: "1 km",
    event: "Flood Event",
  },
  {
    id: "fire",
    name: "Forest Fire",
    description: "Observe fire growth and hotspots in forested regions.",
    region: "Western North America",
    sensor: "MODIS Terra",
    imageType: "Thermal IR",
    frameA: fireA,
    frameMid: fireMid,
    frameB: fireB,
    t0: "2024-08-24 12:00 UTC",
    t1: "2024-08-24 15:00 UTC",
    tmid: "2024-08-24 13:30 UTC",
    spatial: "500 m",
    event: "Wildfire",
  },
  {
    id: "dust",
    name: "Cyclone 2",
    description: "Follow the intensification and track of a second cyclonic system over open ocean.",
    region: "Bay of Bengal",
    sensor: "INSAT-3DR VIS",
    imageType: "Visible",
    frameA: dustA,
    frameMid: dustMid,
    frameB: dustB,
    t0: "2024-10-14 00:00 UTC",
    t1: "2024-10-14 02:00 UTC",
    tmid: "2024-10-14 01:00 UTC",
    spatial: "1 km",
    event: "Tropical Cyclone",
  },
  {
    id: "urban",
    name: "Urban Heat",
    description: "Capture urban heat intensity changes across a metropolitan area.",
    region: "South Asian Megacity",
    sensor: "Landsat 8 TIRS",
    imageType: "Thermal IR",
    frameA: urbanA,
    frameMid: urbanMid,
    frameB: urbanB,
    t0: "2024-06-01 13:00 UTC",
    t1: "2024-06-01 16:00 UTC",
    tmid: "2024-06-01 14:30 UTC",
    spatial: "100 m",
    event: "Urban Heat Island",
  },
];

export const getScenario = (id: string) =>
  scenarios.find((s) => s.id === id) ?? scenarios[0];

export const pipelineStages = [
  { name: "Initializing job", desc: "Load configuration, allocate resources, and validate inputs." },
  { name: "Frame pair selection", desc: "Select consecutive satellite frames T0 and T1 and load metadata." },
  { name: "Radiometric preparation", desc: "Convert to brightness temperature, mask invalid pixels, normalize dynamic range." },
  { name: "Registration & ROI setup", desc: "Align frames spatially, define ROI, preserve geolocation consistency." },
  { name: "Spatial consistency analysis", desc: "Detect scene changes and geometric inconsistencies." },
  { name: "Temporal alignment", desc: "Estimate timing offset and synchronize observation times." },
  { name: "Optical flow estimation", desc: "Compute dense motion field using robust TV-L1 optical flow." },
  { name: "Bidirectional warping", desc: "Warp both frames toward midpoint time to generate candidates." },
  { name: "Deep refinement", desc: "Fuse warped candidates with deep network to reduce blur and ghosting." },
  { name: "Validation & trust scoring", desc: "Compute quality metrics and confidence maps for the refined frame." },
  { name: "Midpoint frame generation", desc: "Finalize midpoint frame and associated confidence map." },
  { name: "Monitoring product assembly", desc: "Assemble outputs, animations, metrics, and analysis layers." },
  { name: "Finalizing results", desc: "Package results and prepare for review on the Results page." },
];
