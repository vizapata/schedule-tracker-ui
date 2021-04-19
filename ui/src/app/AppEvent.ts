import { Person } from './Person'

export const EVENT_TYPE = new Map<string, string>()
EVENT_TYPE.set('EXIT', 'Salida')
EVENT_TYPE.set('ENTRANCE', 'Entrada')

export interface AppEvent {
  id: number,
  date: number,
  deviceName: string,
  eventType: string,
  eventDescription: string,
  person: Person,
  readerName: string,
  verificationMode: string,
  notes: string,
}