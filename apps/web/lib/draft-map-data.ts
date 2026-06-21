import type { MapLeg, MapPoint } from "../components/RouteMap";
import type { NetworkNodeClient } from "./globe/explore-fan-style";

/** Draft map from filled stops (and explore anchor for the first open leg). */
export function mapDataFromStops(
  stops: string[],
  legTypes: ("flight" | "surface")[],
  exploreAnchorIata: string | null,
  nodes: NetworkNodeClient[],
): { points: MapPoint[]; legs: MapLeg[] } {
  const nodeByIata = new Map(nodes.map((n) => [n.iata, n]));
  const pointByIata = new Map<string, MapPoint>();

  function addPoint(iata: string) {
    const code = iata.trim().toUpperCase();
    if (code.length !== 3 || pointByIata.has(code)) return;
    const node = nodeByIata.get(code);
    if (!node) return;
    pointByIata.set(code, {
      iata: code,
      latitude: node.lat,
      longitude: node.lon,
      continent: (node.continent as MapPoint["continent"]) ?? undefined,
    });
  }

  for (const stop of stops) {
    if (stop.trim()) addPoint(stop);
  }
  if (exploreAnchorIata) addPoint(exploreAnchorIata);

  const legs: MapLeg[] = [];
  for (let i = 0; i < stops.length - 1; i++) {
    const fromCode = stops[i]?.trim().toUpperCase();
    if (!fromCode || fromCode.length !== 3) continue;
    const from = pointByIata.get(fromCode);
    if (!from) continue;

    let toCode = stops[i + 1]?.trim().toUpperCase() ?? "";
    if ((!toCode || toCode.length !== 3) && exploreAnchorIata && !stops[i + 1]?.trim()) {
      toCode = exploreAnchorIata.toUpperCase();
    }
    if (!toCode || toCode.length !== 3) continue;
    const to = pointByIata.get(toCode);
    if (!to) continue;

    legs.push({
      from,
      to,
      surface: legTypes[i] === "surface",
    });
  }

  return { points: [...pointByIata.values()], legs };
}
