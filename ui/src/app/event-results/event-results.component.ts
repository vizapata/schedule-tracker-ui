import { HttpResponse } from '@angular/common/http';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
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
  filtered: boolean = false
  range = new FormGroup({
    startDate: new FormControl(),
    endDate: new FormControl()
  });
  eventFilter: EventFilter = {
    text: '',
    eventType: ''
  };
  selectedFiles?: FileList;
  currentFile?: File;
  message = ''; columns: EventDefinition[] = [
    { title: 'ID', columnDef: 'id', value: (e: AppEvent) => e.id },
    { title: 'Fecha', columnDef: 'date', value: (e: AppEvent) => new Date(e.date).toLocaleString() },
    { title: 'Evento', columnDef: 'event', value: (e: AppEvent) => EVENT_TYPE.get(e.eventType) },
    { title: 'Identificación', columnDef: 'personId', value: (e: AppEvent) => e.person.id },
    { title: 'Nombres', columnDef: 'name', value: (e: AppEvent) => `${e.person.firstName} ${e.person.lastName}` },
    { title: 'Departamento', columnDef: 'department', value: (e: AppEvent) => e.person.department },
    { title: 'Área', columnDef: 'area', value: (e: AppEvent) => e.person.area },
  ]
  displayedColumns: string[] = this.columns.map((x: EventDefinition) => x.columnDef)

  constructor(private eventsService: EventsService) { }

  ngAfterViewInit() {
    this.events.paginator = this.paginator;
  }

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
    const filtered = serialized.includes(this.lowerCaseAndTrim(this.eventFilter.text))
    let dateFiltered = true
    if (this.eventFilter.startDate && this.eventFilter.endDate) {
      dateFiltered = this.eventFilter.startDate.getTime() <= data.date && data.date <= this.eventFilter.endDate.getTime()
    }
    else if (this.eventFilter.startDate) {
      dateFiltered = this.eventFilter.startDate.getTime() <= data.date
    }
    else if (this.eventFilter.endDate) {
      dateFiltered = data.date <= this.eventFilter.endDate.getTime()
    }

    const eventTypeFiltered = this.eventFilter.eventType === '' || this.eventFilter.eventType === data.eventType
    return dateFiltered && filtered && eventTypeFiltered
  }

  private reload() {
    this.events.filter = '' + Math.random();
    if (this.events.paginator) {
      this.events.paginator.firstPage();
    }
  }

  applyInputFilter(event: Event) {
    this.filtered = true
    this.eventFilter.text = (event.target as HTMLInputElement).value;
    this.reload()
  }

  applyDateFilter() {
    this.filtered = true
    this.eventFilter.startDate = undefined
    this.eventFilter.endDate = undefined
    if (this.range.get('startDate')) {
      this.eventFilter.startDate = this.range.get('startDate')?.value
      this.eventFilter.startDate?.setHours(0)
      this.eventFilter.startDate?.setMinutes(0)
      this.eventFilter.startDate?.setSeconds(0)
    }
    if (this.range.get('endDate')) {
      this.eventFilter.endDate = this.range.get('endDate')?.value
      this.eventFilter.endDate?.setHours(23)
      this.eventFilter.endDate?.setMinutes(59)
      this.eventFilter.endDate?.setSeconds(59)
    }
    this.reload()
  }

  applyTypeFilter() {
    this.filtered = true
    this.reload()
  }

  clearFilters() {
    this.filtered = false
    this.eventFilter.startDate = undefined
    this.eventFilter.endDate = undefined
    this.range.get('startDate')?.setValue(null)
    this.range.get('endDate')?.setValue(null)
    this.eventFilter.text = ''
    this.eventFilter.eventType = ''
    this.reload()
  }
}
