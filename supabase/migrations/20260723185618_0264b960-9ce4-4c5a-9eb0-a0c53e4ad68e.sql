REVOKE SELECT ON TABLE
  public.tenants,
  public.memberships,
  public.permissions,
  public.tenant_roles,
  public.tenant_role_permissions,
  public.membership_roles,
  public.tenant_invitations,
  public.tenant_invitation_roles,
  public.audit_events
FROM anon;