import { CommonModule, CurrencyPipe, JsonPipe, NgClass, NgFor, NgIf, NgStyle, NgTemplateOutlet } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    NgModule,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { toUtcString, trackByFn } from 'app/shared';
import { PaginatedListResult } from 'app/shared/services/shared.types';
import { SearchInputComponent } from 'app/shared/components/ui/search-input/search-input.component';
import { Service, ServiceSearchParameters } from 'app/modules/service/service.types';
import { ServiceService } from 'app/modules/service/service.service';
import { MaterialModule } from 'app/modules/material.module';
import { ApplicationGridComponent } from 'app/shared/components/application-grid/application-grid.component';
import { CalendarOptions, DateSelectArg, EventApi, EventClickArg } from '@fullcalendar/core';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridWeekPlugin from '@fullcalendar/timegrid';
import { DurationTypes, ServiceTypes, ServiceTypesColor } from 'app/constants';
import { ServiceSidebarComponent } from 'app/modules/service/service-sidebar/service-sidebar.component';
import { MatDrawer } from '@angular/material/sidenav';
import { FuseDrawerComponent } from '@fuse/components/drawer';

declare let $: any;

@UntilDestroy()
@Component({
    selector: 'app-calendar-view',
    templateUrl: './calendar-view.component.html',
    styles: [
        `
            .list-grid {
                grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
            }
        `,
    ],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        NgStyle,
        CurrencyPipe,
        FormsModule,
        ReactiveFormsModule,
        MatProgressBarModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatSortModule,
        NgTemplateOutlet,
        MatPaginatorModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatOptionModule,
        MatCheckboxModule,
        MatRippleModule,
        TranslocoModule,
        SearchInputComponent,
        JsonPipe,
        SearchInputComponent,
        CommonModule,
        MaterialModule,
        ApplicationGridComponent,
        FullCalendarModule,
        FuseDrawerComponent,
        ServiceSidebarComponent,
    ],
})
export class CalendarViewComponent implements OnInit, AfterViewInit {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    @ViewChild('detailsDrawer') detailsDrawer: MatDrawer;

    drawerMode: 'over' | 'side' = 'side';
    drawerOpened = true;

    drawerMode2: 'over' | 'side' = 'side';
    drawerOpened2 = true;

    viewMode: 'calendar' | 'list' = 'calendar';

    flashMessage: 'success' | 'error' | null = null;

    results: PaginatedListResult<Service>;
    list: Service[] = [];
    itemsLoading = false;
    serviceSearchParameters: ServiceSearchParameters;

    activeLang: string;
    selectedItem: Service | null = null;
    selectedItemForm: UntypedFormGroup;

    displayColumns = ['code', 'name', 'serviceType', 'durationType', 'maxCount', 'price', 'priceExtra'];

    serviceTypes = ServiceTypes;
    durationTypes = DurationTypes;

    calendarApi: any;

    @ViewChild('fullCalendar') fullCalendar: FullCalendarComponent;

    calendarOptions: CalendarOptions = {
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
        },
        plugins: [dayGridPlugin, interactionPlugin, timeGridWeekPlugin],
        initialView: 'timeGridWeek',
        // locale: itLocale,
        timeZone: 'UTC',
        // allDaySlot: false,
        weekends: true,
        editable: false,
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        initialDate: Date.now(),
        initialEvents: [],

        events: [],

        customButtons: {
            prev: {
                text: '<',
                click: this.movePrev.bind(this),
            },
            next: {
                text: '>',
                click: this.moveNext.bind(this),
            },
            today: {
                text: 'Oggi',
                click: this.moveToday.bind(this),
            },
        },

        select: this.handleDateSelect.bind(this),
        eventClick: this.handleEventClick.bind(this),
        eventsSet: this.handleEvents.bind(this),
    };

    currentEvent: EventApi;

    trackByFn = trackByFn;

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
        private _serviceService: ServiceService,
        private _translocoService: TranslocoService,
    ) {}

    ngOnInit(): void {
        this.activeLang = this._translocoService.getActiveLang();

        // Services
        this._serviceService.services$.pipe(untilDestroyed(this)).subscribe((results: PaginatedListResult<Service>) => {
            this.results = results;
            this.list = results?.items;
        });

        // Services loading
        this._serviceService.servicesLoading$.pipe(untilDestroyed(this)).subscribe((servicesLoading: boolean) => {
            this.itemsLoading = servicesLoading;
        });

        // Query parameters
        this._serviceService.serviceParameters$
            .pipe(untilDestroyed(this))
            .subscribe((queryParameters: ServiceSearchParameters) => {
                this.serviceSearchParameters = queryParameters;
            });

        // Subscribe to service changes
        this._translocoService.langChanges$.pipe(untilDestroyed(this)).subscribe(activeLang => {
            // Get the active lang
            this.activeLang = activeLang;
        });
    }

    ngAfterViewInit(): void {
        if (this._sort && this._paginator) {
            // Set the initial sort
            this._sort.sort({
                id: 'name',
                start: 'asc',
                disableClear: true,
            });
        }

        this.calendarApi = this.fullCalendar.getApi();
        this.calendarApi.render();

        this.serviceSearchParameters = {
            dateFrom: toUtcString(this.calendarApi.view.activeStart),
            dateTo: toUtcString(this.calendarApi.view.activeEnd),
            pageIndex: 0,
            pageSize: 100,
        };

        this._list();
    }

    handlePageEvent(event: PageEvent): void {
        // this.queryParameters = { ...this.queryParameters, pageIndex: event.pageIndex, pageSize: event.pageSize };

        this._list();
    }

    toggleViewMode() {
        this.viewMode = this.viewMode === 'calendar' ? 'list' : 'calendar';

        setTimeout(() => {
            this.calendarApi = this.fullCalendar.getApi();
            this.calendarApi.render();

            this._list();
        }, 100);
    }

    serviceFilter(parameters: ServiceSearchParameters) {
        console.log('filter', parameters);

        this.serviceSearchParameters.pattern = parameters.pattern;
        // this.serviceSearchParameters.onlyBookmarks = parameters.onlyBookmarks;
        this.serviceSearchParameters.code = parameters.code;
        this.serviceSearchParameters.title = parameters.title;
        this.serviceSearchParameters.note = parameters.note;
        this.serviceSearchParameters.serviceType = parameters.serviceType;
        this.serviceSearchParameters.durationType = parameters.durationType;
        this.serviceSearchParameters.languages = parameters.languages;

        if (parameters.dateFrom) {
            this.serviceSearchParameters.dateFrom = parameters.dateFrom;
        }
        if (parameters.dateTo) {
            this.serviceSearchParameters.dateTo = parameters.dateTo;
        }
    }

    filter(value: string): void {
        this.serviceSearchParameters = { pattern: value };
        this._list();
    }

    private _list(): void {
        this.serviceSearchParameters.pageIndex = 0;
        this.serviceSearchParameters.pageSize = 100;

        this._serviceService
            .listEntities({ ...this.serviceSearchParameters })
            .pipe(untilDestroyed(this))
            .subscribe({
                next: (data: PaginatedListResult<Service>) => {
                    this.list = data.items;
                    // console.log('_list - list', this.list);

                    this.moveToday();
                },
                error: error => {
                    console.error(error);
                    // this._toastr.error(error.detail, 'Error!');
                },
            })
            .add(() => {
                // this.loading = false;
            });
    }

    movePrev() {
        this.calendarApi.prev();
        this.prepareCalendarEvents();
    }

    moveNext() {
        this.calendarApi.next();
        this.prepareCalendarEvents();
    }

    moveToday() {
        this.calendarApi.today();
        this.prepareCalendarEvents();
    }

    prepareCalendarEvents() {
        console.log('list', this.list);
        this.calendarApi.removeAllEvents();

        this.list.forEach(item => {
            const event = {
                title: item.title,
                date: item.date.toString().replace(/T.$/, ''),
                start: item.start.toString().replace(/T.$/, ''),
                end: item.end.toString().replace(/T.$/, ''),
                extendedProps: item,
                color: '',
                // allDay: true,
            };

            if (item.serviceType == 'Guida') {
                event.color = ServiceTypesColor.Guida;
            } else if (item.serviceType == 'Accompagnamento') {
                event.color = ServiceTypesColor.Accompagnamento;
            } else if (item.serviceType == 'Altro') {
                event.color = '#444fd1';
            }

            this.calendarApi?.addEvent(event);
        });

        this.calendarApi?.destroy();
        this.calendarApi?.render();

        /*
        this.serviceSearchParameters = {
            dateFrom: toUtcString(this.calendarApi.view.activeStart),
            dateTo: toUtcString(this.calendarApi.view.activeEnd),
            pageIndex: 0,
            pageSize: 100,
        };

        let calendarItems;
        this._serviceService
            .listEntities(this.serviceSearchParameters)
            .pipe(untilDestroyed(this))
            .subscribe({
                next: (response: any) => {
                    // console.log('prepareCalendarEvents', response);
                    this.list = response.items;
                    calendarItems = response.items;
                    console.log('calendarItems', calendarItems);

                    for (const x of calendarItems) {
                        x.date = x.date.toString().replace(/T.$/, '');
                        x.start = x.start.toString().replace(/T.$/, '');
                        x.end = x.end.toString().replace(/T.$/, '');

                        if (x.serviceType == 'Guida') {
                            x.color = ServiceTypesColor.Guida;
                        } else if (x.serviceType == 'Accompagnamento') {
                            x.color = ServiceTypesColor.Accompagnamento;
                        } else if (x.serviceType == 'Altro') {
                            x.color = '#444fd1';
                        }

                        const event = {
                            title: x.title,
                            date: x.date,
                            // allDay: true,
                            color: x.color,
                            extendedProps: x,
                        };
                        // console.log('event', event);

                        this.calendarApi?.addEvent(event);
                    }

                    console.log('calendarApi', this.calendarApi.events);

                    this.calendarApi?.destroy();

                    // $('#fullCalendar').events.array.forEach(event => {
                    //     console.log(event);
                    //     event.addEventListener('dblclick', function () {
                    //         console.log('dblclick on', event);
                    //     });
                    // });

                    this.calendarApi?.render();
                },
                error: error => {
                    console.error(error);
                    // this._toastr.error(error.detail, 'Error!');
                },
            })
            .add(() => {
                // this.loading = false;
            });
        */
    }

    handleDateSelect(selectInfo: DateSelectArg) {
        console.log('handleDateSelect', selectInfo);
    }

    handleEventClick(clickInfo: EventClickArg) {
        console.log('handleEventClick', clickInfo);
        this.currentEvent = clickInfo.event;
        this.detailsDrawer.toggle();
    }

    handleEvents(events: EventApi[]) {
        console.log('handleEvents', events);
    }

    create() {
        console.log('create');
    }

    closeDrawer(): void {
        this.selectedItem = null;

        this.detailsDrawer.close();

        this._changeDetectorRef.detectChanges();
    }

    drawerOpenedChanged(opened: boolean): void {
        if (!opened) {
            this.selectedItem = null;
        }

        this._changeDetectorRef.detectChanges();
    }
}
