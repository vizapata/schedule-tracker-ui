import { HttpResponse } from '@angular/common/http';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AppEvent, EVENT_TYPE } from '../AppEvent';
import { EventFilter } from '../EventFilter';
import { EventsService } from '../events.service';
export interface EventDefinition {
  title: string;
  columnDef: string;
  value: Function;
}
@Component({
  selector: 'app-event-results',
  templateUrl: './event-results.component.html',
  styleUrls: ['./event-results.component.scss']
})
export class EventResultsComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  fileProcessed: boolean = false;
  events: MatTableDataSource<AppEvent> = new MatTableDataSource<AppEvent>();
  eventFilter: EventFilter = {
    startDate: new Date(),
    endDate: new Date(),
    text: ''
  };
  selectedFiles?: FileList;
  currentFile?: File;
  message = ''; columns: EventDefinition[] = [
    { title: 'ID', columnDef: 'id', value: (e: AppEvent) => e.id },
    { title: 'Fecha', columnDef: 'date', value: (e: AppEvent) => new Date(e.date).toLocaleString() },
    { title: 'Evento', columnDef: 'event', value: (e: AppEvent) => EVENT_TYPE.get(e.eventType) },
    { title: 'Identificación', columnDef: 'personId', value: (e: AppEvent) => e.person.id },
    { title: 'Nombres', columnDef: 'name', value: (e: AppEvent) => `${e.person.firstName} ${e.person.firstName}` },
    { title: 'Departamento', columnDef: 'department', value: (e: AppEvent) => e.person.department },
    { title: 'Área', columnDef: 'area', value: (e: AppEvent) => e.person.area },
  ]
  displayedColumns: string[] = this.columns.map((x: EventDefinition) => x.columnDef)

  constructor(private eventsService: EventsService) { }

  ngAfterViewInit() {
    this.events.paginator = this.paginator;
  }

  get fromDate() { return new Date(2020, 1, 1).getDate(); }
  get toDate() { return new Date(2022, 1, 1).getDate(); }
  // get fromDate() { return this.filterForm.get('fromDate').value; }
  // get toDate() { return this.filterForm.get('toDate').value; }

  selectFile(event: any): void {
    this.selectedFiles = event.target.files;
  }

  processEventsFile(): void {
    if (this.selectedFiles) {
      const file: File | null = this.selectedFiles.item(0);

      if (file) {
        this.currentFile = file;

        this.eventsService.processEventsFile(this.currentFile).subscribe(
          (event: any) => {
            if (event instanceof HttpResponse) {
              this.events = new MatTableDataSource<AppEvent>(event.body)
              this.events.paginator = this.paginator
              this.events.filterPredicate = (data, filter) => this.filterPredicate(data, filter);
              this.events.sort = this.sort
              this.events.sortingDataAccessor = (data, col) => {
                const d = this.columns
                  .filter((e: EventDefinition) => e.columnDef === col)
                  .map((e: EventDefinition) => e.value(data))
                return `${d}`
              };
              this.fileProcessed = true
            }
          },
          (err: any) => {
            console.error(err);

            if (err.error && err.error.message) {
              this.message = err.error.message;
            } else {
              this.message = 'Could not upload the file!';
            }
            this.currentFile = undefined;
          });
      }
      this.selectedFiles = undefined;
    }
  }

  lowerCaseAndTrim = (text: string) => text.replace(/ /ig, '').toLowerCase();
  fullTransform = (list: Array<string>) => this.lowerCaseAndTrim(list.join('$'));

  filterPredicate(data: AppEvent, filter: string) {
    const serialized = this.fullTransform([
      data.person.firstName,
      data.person.lastName, 
      data.person.area,
      data.person.department,
      data.person.id,
    ])

    return serialized.includes(this.lowerCaseAndTrim(this.eventFilter.text))
    // if (this.fromDate && this.toDate) {
    //   return data.date >= this.fromDate && data.date <= this.toDate;
    // }
    // return true;
  }

  applyInputFilter(event: Event) {
    this.eventFilter.text = (event.target as HTMLInputElement).value;
    this.events.filter = '' + Math.random();
    if (this.events.paginator) {
      this.events.paginator.firstPage();
    }
  }
  // applyStartDateFilter(Event) {
  //   this.events.filter;
  // }
  // applyEndDateFilter(Event) {
  //   this.events.filter;
  // }

}
