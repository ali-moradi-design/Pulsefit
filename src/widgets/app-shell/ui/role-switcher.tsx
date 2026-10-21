import { useNavigate } from 'react-router'
import { routes, type Role } from '@/shared/config'
import { Segmented } from '@/shared/ui'

const options = [
  { value: 'athlete', label: 'Athlete' },
  { value: 'coach', label: 'Coach' },
] as const satisfies ReadonlyArray<{ value: Role; label: string }>

export function RoleSwitcher({ role }: { role: Role }) {
  const navigate = useNavigate()
  return (
    <Segmented
      label="Role"
      value={role}
      options={options}
      onChange={(r) => navigate(r === 'athlete' ? routes.athlete.today : routes.coach.athletes)}
    />
  )
}
