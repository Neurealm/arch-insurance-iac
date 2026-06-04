INSERT INTO public.tools_catalog (key, name, description, category, route, icon, is_active)
VALUES ('nav-questionnaires', 'Questionnaires', 'Complete assigned questionnaires and upload evidence', 'Sidebar', '/questionnaires', 'ClipboardList', true)
ON CONFLICT (key) DO UPDATE SET route = EXCLUDED.route, is_active = true;

INSERT INTO public.tenant_tool_assignments (tenant_id, tool_id, enabled)
SELECT t.id, tc.id, true
FROM public.tenants t
CROSS JOIN public.tools_catalog tc
WHERE tc.key = 'nav-questionnaires'
ON CONFLICT (tenant_id, tool_id) DO UPDATE SET enabled = true;