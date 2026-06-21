import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export interface NetworkNode {
  iata: string;
  lat: number;
  lon: number;
  continent: string | null;
  degree: number;
}

export interface NetworkEdge {
  from: string;
  to: string;
  carriers: string[];
}

export interface NetworkSpineEdge {
  from: string;
  to: string;
}

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const nodesPath = join(repoRoot, "data/network-nodes.json");
const edgesPath = join(repoRoot, "data/network-edges.json");
const spinePath = join(repoRoot, "data/network-spine.json");

let cachedNodes: NetworkNode[] | null = null;
let cachedEdges: NetworkEdge[] | null = null;
let cachedSpine: NetworkSpineEdge[] | null = null;

export function loadNetworkNodes(): NetworkNode[] {
  if (cachedNodes) return cachedNodes;
  if (!existsSync(nodesPath)) {
    cachedNodes = [];
    return cachedNodes;
  }
  cachedNodes = JSON.parse(readFileSync(nodesPath, "utf-8")) as NetworkNode[];
  return cachedNodes;
}

export function loadNetworkEdges(): NetworkEdge[] {
  if (cachedEdges) return cachedEdges;
  if (!existsSync(edgesPath)) {
    cachedEdges = [];
    return cachedEdges;
  }
  cachedEdges = JSON.parse(readFileSync(edgesPath, "utf-8")) as NetworkEdge[];
  return cachedEdges;
}

export function loadNetworkSpine(): NetworkSpineEdge[] {
  if (cachedSpine) return cachedSpine;
  if (!existsSync(spinePath)) {
    cachedSpine = [];
    return cachedSpine;
  }
  cachedSpine = JSON.parse(readFileSync(spinePath, "utf-8")) as NetworkSpineEdge[];
  return cachedSpine;
}

export function networkNodeMap(): Map<string, NetworkNode> {
  return new Map(loadNetworkNodes().map((n) => [n.iata, n]));
}
