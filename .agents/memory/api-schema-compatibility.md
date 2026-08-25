---
name: API schema compatibility
description: Zod generation compatibility constraints for this workspace's OpenAPI contracts.
---

The generated server schemas currently target Zod 3, so OpenAPI integer and email formats can emit unsupported top-level helpers. Prefer number plus explicit runtime checks for numeric/email constraints when extending the contract.

**Why:** Codegen can succeed while the chained library typecheck fails if the OpenAPI contract causes Orval to emit Zod 4-only helpers.

**How to apply:** When adding API fields, verify the generated Zod output after codegen before implementing route handlers.