-- Replace dashboard/KPI catalog with the sidebar's top-level sections
-- so tenants enable whole sidebar groups instead of individual dashboards.

-- Clear assignments (they referenced the old fine-grained tool ids)
DELETE FROM public.tenant_tool_assignments;

-- Clear catalog
DELETE FROM public.tools_catalog;

INSERT INTO public.tools_catalog (key, name, description, route, category, is_active) VALUES
  ('nav-operations',   'Operations Overview',                          'Real-time operational health and incidents',                      '/operations',                                  'Sidebar', true),
  ('nav-runops',       'RunOps Practice',                              'IT, EUC, Cloud, Network, App, Data, SRE, EHR, Workforce',         '/practice-library',                            'Sidebar', true),
  ('nav-cyber',        'Cyber Security Practice',                      'IAM, SOC, EDR/XDR, CNAPP, Vulnerability, GRC, DLP, DevSecOps, IR','/practice-library/cyber-security',             'Sidebar', true),
  ('nav-carveout',     'IT Carve-Out & Separation Operating Model',    'Carve-out programs, workstreams, and dashboards',                 '/carve-out',                                   'Sidebar', true),
  ('nav-itsm',         'IT Service Desk & ITSM Operations',            'Executive ITSM, incidents, alerts, change management',            '/itsm',                                        'Sidebar', true),
  ('nav-services',     'Business Services',                            'Service portfolio and health',                                    '/itsm/exec-biz-ops/business-services',         'Sidebar', true),
  ('nav-coworkers',    'Digital Coworkers',                            'SRE, Network, Infra, Carve-out, Healthcare Payer',                '/coworkers',                                   'Sidebar', true),
  ('nav-vendors',      'Vendor Management',                            'Vendor scorecards and SLA tracking',                              '/vendors',                                     'Sidebar', true),
  ('nav-reports',      'Reports & Analytics',                          'Executive reports and analytics',                                 '/reports',                                     'Sidebar', true),
  ('nav-risk',         'Risk & Compliance',                            'Operational, security, and compliance risk',                      '/risk',                                        'Sidebar', true),
  ('nav-knowledge',    'Knowledge Center',                             'Knowledge articles and runbooks',                                 '/knowledge',                                   'Sidebar', true),
  ('nav-audit',        'Audit & Logs',                                 'Audit trail and system logs',                                     '/audit',                                       'Sidebar', true);
