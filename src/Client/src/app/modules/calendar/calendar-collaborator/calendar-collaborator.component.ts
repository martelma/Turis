import { CommonModule, CurrencyPipe, JsonPipe, NgClass, NgFor, NgIf, NgStyle, NgTemplateOutlet } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatSidenavModule } from '@angular/material/sidenav';
import { fuseAnimations } from '@fuse/animations';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { toUtcString, trackByFn } from 'app/shared';
import { PaginatedListResult } from 'app/shared/services/shared.types';
import { SearchInputComponent } from 'app/components/ui/search-input/search-input.component';
import { CalendarInfo, Service, ServiceSearchParameters } from 'app/modules/service/service.types';
import { ServiceService } from 'app/modules/service/service.service';
import { MaterialModule } from 'app/modules/material.module';
import { EventApi } from '@fullcalendar/core';
import { FullCalendarModule } from '@fullcalendar/angular';
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
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserSettingsService } from 'app/shared/services/user-setting.service';
import { CalendarDetailComponent } from '../calendar-detail/calendar-detail.component';
import { KeyboardShortcutsModule } from 'ng-keyboard-shortcuts';
import { GlobalShortcutsService } from 'app/components/ui/global-shortcuts/global-shortcuts.service';
import {
    CalendarBadgesComponent,
    CalendarEventData,
} from 'app/components/ui/calendar-badges/calendar-badges.component';
import { finalize } from 'rxjs';
import { getFirstDayOfMonth, getLastDayOfMonth, getMonthBoundaries, getMonthDateRange } from 'app/shared/shared.utils';
import { addDays } from '@fullcalendar/core/internal';

@UntilDestroy()
@Component({
    selector: 'app-calendar-collaborator',
    templateUrl: './calendar-collaborator.component.html',
    styleUrls: ['./calendar-collaborator.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        KeyboardShortcutsModule,
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
        MatTableModule,
        MatProgressSpinnerModule,
        MatSidenavModule,
        TranslocoModule,
        SearchInputComponent,
        JsonPipe,
        CommonModule,
        MaterialModule,
        FullCalendarModule,
        FuseDrawerComponent,
        ServiceSidebarComponent,
        CalendarDetailComponent,
        CalendarBadgesComponent,
    ],
})
export class CalendarCollaboratorComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
    currentPageTitle = 'Calendar';

    @Input() collaboratorId: string;

    @ViewChild('detailsDrawer') detailsDrawer: MatDrawer;

    getStatusColorClass = getStatusColorClass;
    getBillingStatusColorClass = getBillingStatusColorClass;
    getCommissionStatusColorClass = getCommissionStatusColorClass;

    startDate: Date = getFirstDayOfMonth(new Date());
    currentCalendarDate: Date = new Date(); // The currently displayed date in the calendar to filter events
    calendarEvents = new Map<string, CalendarEventData>([]);
    selectedDayInfo: CalendarInfo = null;

    drawerDetailMode: 'over' | 'side' = 'over';

    // viewMode: 'calendar' | 'list' = 'calendar';
    viewMode = 'list';

    flashMessage: 'success' | 'error' | null = null;

    results: PaginatedListResult<Service>;
    services: Service[] = [];
    loading = false;
    serviceSearchParameters: ServiceSearchParameters = {};
    currentService: Service;
    dateFrom: Date;
    dateTo: Date;

    activeLang: string;
    selectedItem: Service | null = null;
    selectedItemForm: UntypedFormGroup;

    serviceTypes = ServiceTypes;
    durationTypes = DurationTypes;

    displayedColumns: string[] = ['date', 'people', 'languages', 'location', 'serviceType', 'client', 'title'];

    trackByFn = trackByFn;

    private _componentShortcuts = [
        {
            key: 'ctrl + right',
            preventDefault: true,
            label: this.currentPageTitle,
            description: 'Next Day',
            command: () => this.setNextDay(),
        },
        {
            key: 'ctrl + left',
            preventDefault: true,
            label: this.currentPageTitle,
            description: 'Previous Day',
            command: () => this.setPreviousDay(),
        },
    ];

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _serviceService: ServiceService,
        private _translocoService: TranslocoService,
        private _sanitizer: DomSanitizer,
        private _userSettingsService: UserSettingsService,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        public globalShortcutsService: GlobalShortcutsService,
    ) {}

    ngOnInit(): void {
        this.globalShortcutsService.addShortcuts(this.currentPageTitle, this._componentShortcuts);

        this.activeLang = this._translocoService.getActiveLang();

        // Services
        this._serviceService.list$.pipe(untilDestroyed(this)).subscribe((results: PaginatedListResult<Service>) => {
            this.results = results;
            this.services = results?.items;
        });

        // Services loading
        this._serviceService.loading$.pipe(untilDestroyed(this)).subscribe((servicesLoading: boolean) => {
            this.loading = servicesLoading;
        });

        // Query parameters
        this._serviceService.parameters$
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

    async ngAfterViewInit(): Promise<void> {
        const toggleViewModeValue = await this._userSettingsService.getStringValue(
            `${AppSettings.Calendar}:toggleViewMode`,
            'list',
        );

        this.listSummary();
    }

    ngOnChanges(_changes: SimpleChanges): void {
        this._changeDetectorRef.detectChanges();
    }

    ngOnDestroy(): void {
        this.globalShortcutsService.removeShortcuts(this.currentPageTitle);
    }

    setPreviousDay() {
        this.currentCalendarDate = addDays(this.currentCalendarDate, -1);

        const { dateFrom, dateTo } = getMonthDateRange(this.currentCalendarDate);
        if (this.startDate < dateFrom || this.startDate > dateTo) {
            this.startDate = getLastDayOfMonth(this.currentCalendarDate);
            this.listSummary();
        }

        this.list();
    }

    setNextDay() {
        this.currentCalendarDate = addDays(this.currentCalendarDate, 1);

        const { dateFrom, dateTo } = getMonthDateRange(this.currentCalendarDate);
        if (this.startDate < dateFrom || this.startDate > dateTo) {
            this.startDate = getFirstDayOfMonth(this.currentCalendarDate);
            this.listSummary();
        }

        this.list();
    }

    serviceFilter(parameters: ServiceSearchParameters) {
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
        this.list();
    }

    private listSummary(): void {
        const { dateFrom, dateTo } = getMonthBoundaries(this.currentCalendarDate);

        this.dateFrom = new Date(dateFrom);
        this.dateTo = new Date(dateTo);

        this._serviceService
            .listSummary(this.collaboratorId, this.dateFrom, this.dateTo)
            .pipe(
                finalize(() => {
                    this.loading = false;
                }),
                untilDestroyed(this),
            )
            .subscribe({
                next: (data: CalendarInfo[]) => {
                    this.calendarEvents = new Map(
                        data.map(item => {
                            const dateKey =
                                typeof item.date === 'string'
                                    ? item.date.split('T')[0]
                                    : item.date.toISOString().split('T')[0];
                            return [dateKey, { primary: item.countConfirmed, secondary: item.countPending }];
                        }),
                    );
                    console.log('calendarEvents', this.calendarEvents);
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

    private list(): void {
        this.dateFrom = this.currentCalendarDate;
        this.dateTo = new Date(this.currentCalendarDate);
        this.dateTo.setDate(this.dateTo.getDate() + 1);

        this.serviceSearchParameters.pageIndex = 0;
        this.serviceSearchParameters.pageSize = 100;
        this.serviceSearchParameters.dateFrom = toUtcString(this.dateFrom);
        this.serviceSearchParameters.dateTo = toUtcString(this.dateTo);
        this.serviceSearchParameters.collaboratorId = this.collaboratorId;

        // console.log('serviceSearchParameters', this.serviceSearchParameters);

        this.loading = true;

        this._serviceService
            .myCalendar(this.collaboratorId, { ...this.serviceSearchParameters })
            .pipe(
                finalize(() => {
                    this.loading = false;
                }),
                untilDestroyed(this),
            )
            .subscribe({
                next: (data: PaginatedListResult<Service>) => {
                    this.services = data.items;

                    this.services.forEach(item => {
                        if (item.collaborator) {
                            item.collaborator.avatarUrl = item.collaborator.avatar
                                ? this._sanitizer.bypassSecurityTrustResourceUrl(
                                      `data:image/jpg;base64, ${item.collaborator.avatar}`,
                                  )
                                : undefined;

                            item.collaborator.avatarUrl2 = this._sanitizer.bypassSecurityTrustUrl(
                                item.collaborator?.avatar,
                            );
                        }
                    });

                    console.log('services', this.services);
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

    onDateSelected($event: { date: Date; eventCount: number }): void {
        console.log('onDateSelected', $event);

        this.currentCalendarDate = $event.date;

        this.list();
    }

    onCalendarViewChanged(date: Date): void {
        this.currentCalendarDate = date;

        this.listSummary();
    }

    selectedService(service: Service) {
        // console.log('selectedService', service);
        this.currentService = service;
        this.detailsDrawer.toggle();
    }

    handleEvents(_events: EventApi[]) {
        // console.log('handleEvents', events);
    }

    createService() {
        this._router.navigate(['../service', 'new'], { relativeTo: this._activatedRoute });
    }

    closeDrawer(): void {
        this.selectedItem = null;

        this.detailsDrawer.close();

        this._changeDetectorRef.detectChanges();
    }

    async drawerDetailsChanged(opened: boolean): Promise<void> {
        if (!opened) {
            this.selectedItem = null;
        }

        this._changeDetectorRef.detectChanges();
    }
}
