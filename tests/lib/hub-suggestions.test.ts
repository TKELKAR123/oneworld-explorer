import { describe, expect, it } from "vitest";
import { hubActionsFromNetwork } from "../../apps/web/lib/hub-suggestions";

describe("hub-suggestions", () => {
  it("builds insert action with human label", () => {
    const actions = hubActionsFromNetwork(0, "LHR", "SYD", [
      {
        hub: "SIN",
        firstLegCarriers: ["BA"],
        secondLegCarriers: ["QF"],
      },
    ]);
    expect(actions).toHaveLength(1);
    expect(actions[0]!.insertAt).toBe(1);
    expect(actions[0]!.toHub).toBe("SIN");
    expect(actions[0]!.insertLabel).toMatch(/between LHR and SYD/i);
    expect(actions[0]!.label).toMatch(/Singapore/i);
    expect(actions[0]!.label).toMatch(/British Airways/i);
  });
});
