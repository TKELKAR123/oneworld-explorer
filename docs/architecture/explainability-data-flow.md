# Explainability data flow (v0.1.3+)

```mermaid
flowchart LR
  YAML[R3015-formal.yaml]
  Eval[evaluateRulesWithTrace]
  App[applicability.ts]
  Meta[rule-metadata.ts]
  API[POST /api/validate]
  CR[ComplianceReport]
  FG[FixGuide]

  YAML --> Eval
  Eval --> App
  Meta --> App
  Eval --> API
  API --> CR
  API --> FG
```

- **Pass (applicable):** `ruleEvaluations` where `passed && applicability === active` → ComplianceReport
- **Fail:** `ruleEvaluations` where `!passed && applicability === active` → ComplianceReport blocking section + FixGuide
- **Not applicable:** `applicability === notApplicable` → collapsed footer
- **Advisories:** `ruleKind === advisory` → Product checks panel
- **Origin/return:** `analysis.originReturn` → Return badge, summary strip, compliance card

See [`open-jaw-vs-surface.md`](open-jaw-vs-surface.md) for §4(c) vs §4(g).
