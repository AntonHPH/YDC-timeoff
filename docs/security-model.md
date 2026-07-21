# Security Model

## Identity

- Primary: Microsoft Entra ID (OIDC/OAuth2)
- Optional: AD federated SSO
- API uses JWT bearer tokens

## RBAC roles

- `Employee`
- `Supervisor`
- `Manager`
- `HR`
- `SystemAdministrator`

## Permission matrix (sample)

| Capability | Employee | Supervisor | Manager | HR | SystemAdministrator |
|---|---|---|---|---|---|
| Submit leave | Y | Y | Y | Y | Y |
| Approve direct reports | N | Y | Y | Y | Y |
| HR verification | N | N | N | Y | Y |
| Leave type maintenance | N | N | N | Y | Y |
| Access control maintenance | N | N | N | N | Y |
| View HR-only attachments | N | N | N | Y | Y |

## Security controls

- Least privilege and policy-based authorization
- Row-level filtering by organization scope
- Audit trail on create/update/approve/reject/export
- Attachment access restrictions with signed URL expiry
- Configurable data retention and legal hold

## Compliance readiness

- Full traceability on leave decisions
- Immutable event logs for approvals
- Encryption in transit (TLS 1.2+) and at rest (TDE, storage encryption)

