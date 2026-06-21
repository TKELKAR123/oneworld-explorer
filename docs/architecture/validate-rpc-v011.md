# Validate RPC v0.1.1

## POST /api/validate

### Request

```json
{
  "travelClass": "economy",
  "stops": ["JFK", "LHR", "DXB", "SIN", "SYD", "LAX", "JFK"],
  "legTypes": ["flight", "flight", "flight", "flight", "flight", "flight"]
}
```

Legacy `segments[]` supported with continuity check.

### Response (extended)

```json
{
  "valid": true,
  "outcome": "valid",
  "blockingIssueCount": 0,
  "warningCount": 0,
  "rulesVersion": "2026-02-27",
  "issues": [],
  "ruleEvaluations": [
    {
      "ruleId": "R3015-4a",
      "passed": true,
      "severity": "info",
      "category": "routing",
      "pdfRef": "§4(a), page 2",
      "naturalLanguage": "...",
      "evidence": ["Atlantic crossings: 1", "Pacific crossings: 1"]
    }
  ],
  "suggestions": [],
  "analysis": { }
}
```
