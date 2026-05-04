-- FlowTime Demo Seed Data
-- Instructions: Run this in the Supabase SQL Editor

-- 1. Info Pages
INSERT INTO public.info_pages (title, category, icon, content, "order")
VALUES 
('🚑 Premiers secours', 'Procédures', '🚑', '# Procédure d''urgence\n\nLe défibrillateur se trouve derrière le bar central, à côté de la trousse de secours.', 1),
('📋 Ouverture du bar', 'Procédures', '📋', '# Checklist Ouverture\n\n- [ ] Sortir les transats\n- [ ] Nettoyer les tables', 2),
('🍹 Carte cocktails', 'Recettes', '🍹', '# Recettes Signature\n\n## Mojito Flow\n- 6cl Rhum Blanc', 3),
('📞 Contacts urgents', 'Contacts', '📞', '# Téléphones Utiles\n\n- **Elin (Admin)**: +32 470 00 00 01', 4),
('📝 Mon contrat', 'Admin', '📝', '# Informations Contractuelles\n\nVotre contrat est un contrat étudiant ou extra.', 5)
ON CONFLICT (title) DO NOTHING;

-- 2. Users (Manual demo entry)
-- Note: It is better to use the scripts/seed.ts for users as it handles UUIDs correctly.
-- But you can insert Elin manually here if you want:
-- INSERT INTO public.users (id, email, role, first_name, last_name) 
-- VALUES ('<YOUR_AUTH_USER_ID>', 'elin@theflow.be', 'admin', 'Elin', 'TheFlow');
