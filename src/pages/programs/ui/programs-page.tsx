import { useProgram } from '@/entities/training'
import { ProgramEditor } from '@/features/edit-program'

export function ProgramsPage() {
  const program = useProgram()
  return (
    <section aria-labelledby="page-title" className="flex flex-col gap-3.5">
      <h1 id="page-title" className="text-2xl font-bold">
        Training program
      </h1>
      {program && <ProgramEditor key={program.id} program={program} athleteName="Sam" />}
    </section>
  )
}
