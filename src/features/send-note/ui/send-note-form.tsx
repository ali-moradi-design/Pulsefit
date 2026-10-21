import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Button } from '@/shared/ui'
import { noteSchema, sendNote } from '../model/send-note'

export function SendNoteForm({ athleteName }: { athleteName: string }) {
  const { register, handleSubmit, reset, formState } = useForm<z.infer<typeof noteSchema>>({
    resolver: zodResolver(noteSchema),
    defaultValues: { text: '' },
  })
  return (
    <form
      noValidate
      className="flex flex-col gap-2"
      onSubmit={handleSubmit(async (v) => {
        await sendNote(v.text)
        reset()
      })}
    >
      <label className="flex flex-col gap-1 rounded-2xl border border-border bg-surface px-3.5 py-2">
        <span className="text-[11px] font-semibold tracking-[.06em] text-muted uppercase">
          Note to {athleteName}
        </span>
        <textarea
          rows={2}
          className="resize-none bg-transparent outline-none"
          {...register('text')}
        />
      </label>
      {formState.errors.text && (
        <p role="alert" className="text-sm text-accent">
          {formState.errors.text.message}
        </p>
      )}
      <Button type="submit" disabled={formState.isSubmitting}>
        Send note
      </Button>
      {formState.isSubmitSuccessful && (
        <p role="status" className="text-center text-sm font-semibold text-ok">
          Sent.
        </p>
      )}
    </form>
  )
}
