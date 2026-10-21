import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../db'
import { deleteRecord, saveRecord } from './outbox'

describe('outbox', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
  })

  it('writes the record and queues the change in one step', async () => {
    await saveRecord('bodyLogs', { id: 'b1', date: '2026-10-21', weightKg: 81 })
    expect(await db.bodyLogs.get('b1')).toMatchObject({ weightKg: 81 })
    const queued = await db.outbox.toArray()
    expect(queued).toHaveLength(1)
    expect(queued[0]).toMatchObject({ table: 'bodyLogs', op: 'put', key: 'b1' })
  })

  it('queues deletes in order after puts', async () => {
    await saveRecord('notes', { id: 'n1', text: 'hi', createdAt: 1 })
    await deleteRecord('notes', 'n1')
    expect(await db.notes.get('n1')).toBeUndefined()
    expect((await db.outbox.orderBy('seq').toArray()).map((e) => e.op)).toEqual(['put', 'delete'])
  })
})
