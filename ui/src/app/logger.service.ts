import { Injectable } from '@angular/core';

interface LogPayload {
  type: string
  date: Date,
  message: string
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  private active: boolean = true

  constructor() { }

  log(message: string, type: string) {
    this.logIt(console.log, { type, date: new Date(), message })
  }

  info(message: string) {
    this.logIt(console.info, { type: 'info', date: new Date(), message })
  }

  debug(message: string) {
    this.logIt(console.debug, { type: 'debug', date: new Date(), message })
  }

  error(message: string) {
    this.logIt(console.error, { type: 'error', date: new Date(), message })
  }

  private logIt(func: Function, payload: LogPayload) {
    if (this.active) func(`[${payload.type}][${payload.date}]: ${payload.message}`)
  }
}
