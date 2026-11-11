---
name: Signup without email confirmation
description: The user's requested HIKAYAT signup policy and the configuration boundary.
---

The user said: "خليني اسوي حساب جديد على طول ولا تسال عن التحقق" — let users create an account immediately without asking for email verification.

**Why:** The user explicitly requested this signup behavior after encountering signup failures.

**How to apply:** Use Supabase Auth's supported Confirm Email setting rather than fabricating sessions or modifying Auth records directly. Do not re-ask whether they want email confirmation. This records their desired policy, not proof that the hosted setting was changed.
