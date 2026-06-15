# Project Thesis — Requirements ↔ Implementation

This repository is an **oneworld Explorer** RTW route planner. It is **not** a general fare product builder.

## The problem

Business rules live in prose (PDFs, Confluence). Engineering implements adjacent logic. Users see authoritative UI with no audit trail. Spec, code, and copy drift apart.

## This repo's answer

One traceability chain:

```
Rule 3015 PDF → R3015-formal.yaml → evaluators → tests → UI traces
```

Every rejection cites a `ruleId` linked to PDF text, YAML natural language, a test, and runtime evidence.

## How to review (non-engineers)

Read `naturalLanguage` and `ambiguities` in [R3015-formal.yaml](./rules/R3015-formal.yaml). Product evaluation is encoded in `tests/scenarios/` — run `npm test`.

Predicates in YAML are for engineering; you do not need to edit them to align on requirements.
