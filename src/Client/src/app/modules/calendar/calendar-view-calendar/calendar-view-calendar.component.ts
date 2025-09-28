import { CommonModule, CurrencyPipe, JsonPipe, NgClass, NgFor, NgIf, NgStyle, NgTemplateOutlet } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
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
import { SearchInputComponent } from 'app/components/global-shortcuts/ui/search-input/search-input.component';
import { Service, ServiceSearchParameters } from 'app/modules/service/service.types';
import { ServiceService } from 'app/modules/service/service.service';
import { MaterialModule } from 'app/modules/material.module';
import { CalendarOptions, DateSelectArg, EventApi, EventClickArg } from '@fullcalendar/core';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import {
    AppSettings,
    DurationTypes,
    getBillingStatusColorClass,
    getCommissionStatusColorClass,
    getStatusColorClass,
    ServiceTypes,
} from 'app/constants';
import { ServiceSidebarComponent } from 'app/modules/service/service-sidebar/service-sidebar.component';
import { MatDrawer } from '@angular/material/sidenav';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ez } from '@fullcalendar/core/internal-common';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridWeekPlugin from '@fullcalendar/timegrid';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserSettingsService } from 'app/shared/services/user-setting.service';
import { CalendarViewGridComponent } from '../calendar-view-grid/calendar-view-grid.component';
import { CalendarDetailComponent } from '../calendar-detail/calendar-detail.component';

declare let $: any;

@UntilDestroy()
@Component({
    selector: 'app-calendar-view-calendar',
    templateUrl: './calendar-view-calendar.component.html',
    styleUrls: ['./calendar-view-calendar.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        NgStyle,
        CurrencyPipe,
        RouterLink,
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
        MatTooltipModule,
        TranslocoModule,
        SearchInputComponent,
        JsonPipe,
        SearchInputComponent,
        CommonModule,
        MaterialModule,
        FullCalendarModule,
        FuseDrawerComponent,
        ServiceSidebarComponent,
        CalendarViewGridComponent,
        CalendarDetailComponent,
    ],
})
export class CalendarViewCalendarComponent implements OnInit, AfterViewInit {
    @ViewChild('fullCalendar') fullCalendar: FullCalendarComponent;

    @Input() dateFrom: Date;
    @Output() dateFromChange = new EventEmitter<Date>();
    @Input() dateTo: Date;
    @Output() dateToChange = new EventEmitter<Date>();

    private _services: Service[] = [];
    @Input()
    get services(): Service[] {
        return this._services;
    }

    set services(services: Service[]) {
        this._services = services;
        // console.log('_services', this._services);
        this.prepareCalendarEvents();
    }

    @Output() readonly onSelectedService: EventEmitter<Service> = new EventEmitter<Service>();
    @Output() readonly onDateChanged: EventEmitter<void> = new EventEmitter<void>();

    getStatusColorClass = getStatusColorClass;
    getBillingStatusColorClass = getBillingStatusColorClass;
    getCommissionStatusColorClass = getCommissionStatusColorClass;

    drawerFilterMode: 'over' | 'side' = 'side';
    drawerFilterOpened = true;

    drawerDetailMode: 'over' | 'side' = 'side';

    // viewMode: 'calendar' | 'list' = 'calendar';
    viewMode = 'calendar';

    flashMessage: 'success' | 'error' | null = null;

    results: PaginatedListResult<Service>;
    itemsLoading = false;
    serviceSearchParameters: ServiceSearchParameters;

    activeLang: string;
    selectedItem: Service | null = null;
    selectedItemForm: UntypedFormGroup;

    serviceTypes = ServiceTypes;
    durationTypes = DurationTypes;

    calendarApi: any;
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

        eventContent: function (arg) {
            let template;
            if (arg.view.type === 'dayGridMonth') {
                template = monthTemplate(arg.event);
            } else {
                template = weekDayTemplate(arg.event);
            }
            return template;
        },
    };

    currentEvent: EventApi;
    currentService: Service;

    trackByFn = trackByFn;

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
        private _serviceService: ServiceService,
        private _translocoService: TranslocoService,
        private _sanitizer: DomSanitizer,
        private _userSettingsService: UserSettingsService,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
    ) {}

    async ngOnInit(): Promise<void> {
        this.activeLang = this._translocoService.getActiveLang();
    }

    async ngAfterViewInit(): Promise<void> {
        this.calendarApi = this.fullCalendar.getApi();
        this.calendarApi.render();

        if (!this.dateFrom) {
            this.setDates();
        }
    }

    handlePageEvent(event: PageEvent): void {}

    movePrev() {
        this.calendarApi.prev();
        this.setDates();
    }

    moveNext() {
        this.calendarApi.next();
        this.setDates();
    }

    moveToday() {
        this.calendarApi.today();
        this.setDates();
    }

    setDates() {
        this.dateFrom = this.calendarApi.view.activeStart;
        this.dateFromChange.emit(this.dateFrom);
        this.dateTo = this.calendarApi.view.activeEnd;
        this.dateToChange.emit(this.dateTo);
        this.onDateChanged.emit();
    }

    prepareCalendarEvents() {
        // console.log('_services', this._services);
        this.calendarApi?.removeAllEvents();

        this._services?.forEach(item => {
            const event = {
                title: item.title,
                date: item.date.toString().replace(/T.$/, ''),
                start: item.start.toString().replace(/T.$/, ''),
                end: item.end.toString().replace(/T.$/, ''),
                extendedProps: item,
                color: '',
                // allDay: true,
            };

            /*
            if (item.serviceType == 'Guida') {
                event.color = ServiceTypesColor.Guida;
            } else if (item.serviceType == 'Accompagnamento') {
                event.color = ServiceTypesColor.Accompagnamento;
            } else if (item.serviceType == 'Altro') {
                event.color = '#444fd1';
            }
            */

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
        // console.log('handleDateSelect', selectInfo);
    }

    handleEventClick(clickInfo: EventClickArg) {
        // console.log('handleEventClick', clickInfo);
        this.currentEvent = clickInfo.event;
        this.currentService = clickInfo.event.extendedProps as Service;
        this.onSelectedService.emit(this.currentService);
    }

    async toggleFilter() {
        this.drawerFilterOpened = !this.drawerFilterOpened;

        const value = this.drawerFilterOpened ? 'true' : 'false';
        await this._userSettingsService.setValue(`${AppSettings.Calendar}:toggleFilter`, value);
    }

    handleEvents(events: EventApi[]) {
        // console.log('handleEvents', events);
    }

    createService() {
        this._router.navigate(['service', 'new'], { relativeTo: this._activatedRoute });
    }

    async drawerDetailsChanged(opened: boolean): Promise<void> {
        if (!opened) {
            this.selectedItem = null;
        }

        this._changeDetectorRef.detectChanges();
    }
}

function weekDayTemplate(event: ez): any {
    const service = event?.extendedProps as Service;

    // console.log('service.collaborator?.avatarUrl', service.collaborator?.avatarUrl);

    // service.collaborator.avatarUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde';

    // questa riga l'ho tolta perché funziona solo se abbiamo un url già risolto come quello qui sopra.
    // <img *ngIf="avatarUrl" class="avatar-img" alt="Avatar" [src]="${service.collaborator?.avatarUrl}" />

    if (service.collaboratorId) {
        return {
            html: `
                    <div class="fc-event-avatar">
                        <div class="event-details">
                            <div class="event-title" [matTooltip]="Titolo">${service.title}</div>
                            <div class="event-info">Servizio: ${service.serviceType}</div>
                            <div class="event-info" [matTooltip]="Location">Location: ${service.location}</div>
                            <div class="event-info">People: ${service.people}</div>
                            <div class="event-info">Client:</div>
                            <div class="event-info">${service.client?.fullName}</div>
                            <div class="event-info">Collaborator:</div>
                            <div class="event-info">${service.collaborator?.fullName}</div>
                        </div>
                    </div>
                    `,
        };
    } else {
        const description = event.extendedProps.description;
        return {
            html: `
                    <div class="fc-event-description">
                    <div class="event-title">${event.title}</div>
                    <div class="event-description">${description}</div>
                    </div>
                    `,
        };
    }
}

function monthTemplate(event: ez): any {
    const service = event.extendedProps as Service;
    if (service.collaboratorId) {
        const avatarUrl = service.collaborator?.avatarUrl;
        return {
            html: `
                    <div class="fc-event-content" style="display: flex; align-items: center;">
                        <img src="${avatarUrl}" alt="Avatar" class="avatar-img" style="width: 20px; height: 20px; margin-right: 15px;" />
                        <div>
                            <div class="event-title" style="font-weight: bold; font-size: 1.2em;">
                                ${service.title}
                            </div>
                            <!--<div class="event-fullname" style="font-size: 0.9em;">
                                ${service.collaborator?.fullName}
                            </div>-->
                        </div>
                    </div>
                    `,
        };
    } else {
        return {
            html: `
                    <div class="fc-event-content" style="display: flex; align-items: center;">
                        <div>
                            <div class="event-title" style="font-weight: bold; font-size: 1.2em;">
                                ${service.title}
                            </div>
                            <div class="event-fullname" style="font-size: 0.9em;">
                                ${service.collaborator?.fullName}
                            </div>
                        </div>
                    </div>
                    `,
        };
    }
}
