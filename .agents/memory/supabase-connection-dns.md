---
name: Supabase direct connection DNS
description: Distinguishing direct database endpoint failures from malformed Supabase credentials.
---

When Supabase PostgreSQL reports `ENOTFOUND`, check whether the configured endpoint is the direct database endpoint and resolves only to IPv6 before repeatedly requesting password changes.

**Why:** In this workspace the direct endpoint resolved with an IPv6 address through Node DNS, but the PostgreSQL driver's connection lookup still failed with `ENOTFOUND`. This was not evidence that the password was incorrect.

**How to apply:** Request the Session pooler URI through Secrets for an IPv4-compatible connection. Validate the endpoint type without printing its host or credentials, then test an actual read-only connection.

For encrypted pooler connections, a `SELF_SIGNED_CERT_IN_CHAIN` error can mean the client needs Supabase's published root CA, not that TLS should be disabled.

**Why:** The Session pooler connected successfully with full certificate and hostname verification after trusting the official Supabase root certificate. Disabling verification would conceal the actual trust configuration issue.

**How to apply:** Consult Supabase's SSL enforcement documentation for the official CA download. Keep `rejectUnauthorized` enabled and never use `sslmode=no-verify` as a workaround.
