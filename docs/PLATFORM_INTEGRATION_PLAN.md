# Platform Integration Plan

External integrations, in activation order. Each is code-complete or code-ready; activation needs credentials from the platform owner.

1. **Clerk (auth/RBAC)** — principal resolution and org-role sync plan are live (`/dashboard/identity/clerk-sync`); executing the plan needs `CLERK_SECRET_KEY`.
2. **PostgreSQL on DigitalOcean** — persistence ports and DDL ready (`docs/PERSISTENCE.md`); needs a managed cluster and `DATABASE_URL`.
3. **Statutory payment portals** — remittance links are live per jurisdiction (KRA iTax, TaxPro-Max, HMRC, EFTPS, GST Portal, e-CAC, ATO); deeper API integrations (e-filing, payment confirmation webhooks) follow persistence.
4. **DigitalOcean App Platform** — deployment of `apps/admin` with environment secrets; follows persistence.
5. **Email/SMS/object storage/monitoring** — deferred until after deployment.
