import { HttpClient, HttpErrorResponse, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AppEvent } from './AppEvent';
import { LoggerService } from './logger.service';

const eventsAPI = 'events/details'
@Injectable({
  providedIn: 'root'
})
export class EventsService {

  constructor(private httpClient: HttpClient, private logger: LoggerService) {
  }

  public getEvents() {
    return this.httpClient
      .get<AppEvent[]>(`${environment.apiUrl}${eventsAPI}`)
      .pipe(
        retry(1),
        catchError((error) => this.handleError(error))
      )
  }

  public processEventsFile(file: File): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();

    formData.append('file', file);

    const req = new HttpRequest('POST', `${environment.apiUrl}${eventsAPI}`, formData, {
      responseType: 'json'
    });

    return this.httpClient.request(req);
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      this.logger.log(error.error.message, 'An error occurred')
    } else {
      this.logger.error(`Backend returned code ${error.status}, body was: ${error.error}`)
    }
    return throwError('Something bad happened; please try again later.')
  }
}
