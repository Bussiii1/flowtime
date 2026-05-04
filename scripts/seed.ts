import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seed() {
  console.log('🚀 Starting seeding...')

  // 1. Clear existing data (optional, but good for demo)
  // await supabase.from('shifts').delete().neq('id', uuidv4())
  // await supabase.from('users').delete().neq('role', 'admin')

  // 2. Create Employees
  const employees = [
    { first_name: 'Pablo', last_name: 'Vandamme', email: 'pablo@example.com', role: 'employee', status_type: 'student', hourly_rate: 14.50, password: 'password123' },
    { first_name: 'Adrien', last_name: 'Dupont', email: 'adrien@example.com', role: 'employee', status_type: 'extra', hourly_rate: 44.02, password: 'password123' },
    { first_name: 'Arnaud', last_name: 'Leclerc', email: 'arnaud@example.com', role: 'employee', status_type: 'volunteer', hourly_rate: 0, password: 'password123' },
    { first_name: 'Charlotte', last_name: 'Moreau', email: 'charlotte@example.com', role: 'employee', status_type: 'student', hourly_rate: 15.00, password: 'password123' },
    { first_name: 'Manon', last_name: 'Peeters', email: 'manon@example.com', role: 'employee', status_type: 'student', hourly_rate: 14.00, password: 'password123' },
    { first_name: 'Victor', last_name: 'Monnoyer', email: 'victor@example.com', role: 'employee', status_type: 'extra', hourly_rate: 44.02, password: 'password123' },
    { first_name: 'Léa', last_name: 'Dubois', email: 'lea@example.com', role: 'employee', status_type: 'student', hourly_rate: 15.50, password: 'password123' },
    { first_name: 'Thomas', last_name: 'Janssens', email: 'thomas@example.com', role: 'employee', status_type: 'extra', hourly_rate: 44.02, password: 'password123' },
    { first_name: 'Elin', last_name: 'TheFlow', email: 'elin@theflow.be', role: 'admin', status_type: 'extra', hourly_rate: 0, password: 'password123' },
  ]

  for (const emp of employees) {
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: emp.email,
      password: emp.password,
      email_confirm: true
    })

    if (authError && authError.message !== 'User already exists') {
      console.error(`Error creating auth user ${emp.email}:`, authError)
      continue
    }

    const userId = authUser?.user?.id || (await supabase.from('users').select('id').eq('email', emp.email).single()).data?.id

    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        first_name: emp.first_name,
        last_name: emp.last_name,
        email: emp.email,
        role: emp.role,
        status_type: emp.status_type,
        hourly_rate: emp.hourly_rate
      })

    if (profileError) console.error(`Error upserting profile ${emp.email}:`, profileError)
  }

  const { data: allUsers } = await supabase.from('users').select('*')
  const employeeUsers = allUsers?.filter(u => u.role === 'employee') || []

  if (employeeUsers.length === 0) {
    console.error('No employees created. Aborting shifts seeding.')
    return
  }
  console.log(`✅ ${employeeUsers.length} employees ready for shifts.`)


  // 3. Create Info Pages
  const infoPages = [
    {
      title: '🚑 Premiers secours',
      category: 'Procédures',
      icon: '🚑',
      content: '# Procédure d\'urgence\n\nLe défibrillateur se trouve derrière le bar central, à côté de la trousse de secours.\n\n1. Appelez le **112** immédiatement.\n2. Prévenez le manager de zone.\n3. Utilisez le défibrillateur (il est automatique).',
      order: 1
    },
    {
      title: '📋 Ouverture du bar',
      category: 'Procédures',
      icon: '📋',
      content: '# Checklist Ouverture\n\n- [ ] Sortir les transats\n- [ ] Nettoyer les tables\n- [ ] Vérifier les stocks de glaçons\n- [ ] Allumer la musique (volume 20%)',
      order: 2
    },
    {
      title: '🍹 Carte cocktails',
      category: 'Recettes',
      icon: '🍹',
      content: '# Recettes Signature\n\n## Mojito Flow\n- 6cl Rhum Blanc\n- 3cl Jus de Citron Vert\n- 2cl Sirop de Canne\n- Menthe fraîche\n- Soda\n\n## Spritz des Plages\n- 9cl Prosecco\n- 6cl Aperol\n- 3cl Eau pétillante',
      order: 3
    },
    {
      title: '📞 Contacts urgents',
      category: 'Contacts',
      icon: '📞',
      content: '# Téléphones Utiles\n\n- **Elin (Admin)**: +32 470 00 00 01\n- **Police Knokke**: 101\n- **Maintenance Frigo**: +32 470 99 99 99',
      order: 4
    },
    {
      title: '📝 Mon contrat',
      category: 'Admin',
      icon: '📝',
      content: '# Informations Contractuelles\n\nVotre contrat est un contrat étudiant ou extra. Les heures sont payées le 5 du mois suivant.',
      order: 5
    }
  ]

  await supabase.from('info_pages').upsert(infoPages, { onConflict: 'title' })
  console.log('✅ Info pages created.')

  // 4. Create Shifts (50 shifts over 30 days)
  const shifts = []
  const statuses = ['validated', 'pending', 'rejected']
  
  for (let i = 0; i < 50; i++) {
    const user = employeeUsers[Math.floor(Math.random() * employeeUsers.length)]
    const daysAgo = Math.floor(Math.random() * 30)
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    const dateStr = date.toISOString().split('T')[0]
    
    const startHour = 9 + Math.floor(Math.random() * 8)
    const duration = 4 + Math.floor(Math.random() * 8)
    let endHour = startHour + duration
    if (endHour >= 24) endHour = 23
    
    shifts.push({
      user_id: user.id,
      date: dateStr,
      start_time: `${startHour.toString().padStart(2, '0')}:00`,
      end_time: `${endHour.toString().padStart(2, '0')}:00`,
      break_minutes: duration > 7.5 ? 30 : 0,
      status: statuses[Math.floor(Math.random() * (i < 40 ? 1 : 3))], // Mostly validated for demo
      notes: i % 10 === 0 ? 'Affluence exceptionnelle au bar.' : null
    })
  }

  const { error: shiftError } = await supabase.from('shifts').insert(shifts)
  if (shiftError) console.error('Error seeding shifts:', shiftError)
  else console.log('✅ 50 shifts created.')

  console.log('🎉 Seeding complete!')
}

seed()
