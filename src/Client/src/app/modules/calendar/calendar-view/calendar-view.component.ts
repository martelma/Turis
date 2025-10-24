import { CommonModule, CurrencyPipe, JsonPipe, NgClass, NgFor, NgIf, NgStyle, NgTemplateOutlet } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
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
import { fuseAnimations } from '@fuse/animations';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { toUtcString, trackByFn } from 'app/shared';
import { PaginatedListResult } from 'app/shared/services/shared.types';
import { SearchInputComponent } from 'app/components/ui/search-input/search-input.component';
import { Service, ServiceSearchParameters } from 'app/modules/service/service.types';
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
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserSettingsService } from 'app/shared/services/user-setting.service';
import { CalendarViewGridComponent } from '../calendar-view-grid/calendar-view-grid.component';
import { CalendarDetailComponent } from '../calendar-detail/calendar-detail.component';
import { CalendarViewCalendarComponent } from '../calendar-view-calendar/calendar-view-calendar.component';
import { KeyboardShortcutsModule } from 'ng-keyboard-shortcuts';
import { GlobalShortcutsService } from 'app/components/ui/global-shortcuts/global-shortcuts.service';

declare let $: any;

@UntilDestroy()
@Component({
    selector: 'app-calendar-view',
    templateUrl: './calendar-view.component.html',
    styleUrls: ['./calendar-view.component.scss'],
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
        CalendarViewCalendarComponent,
    ],
})
export class CalendarViewComponent implements OnInit, OnDestroy, AfterViewInit {
    currentPageTitle = 'Calendar';
    private _componentShortcuts = [
        {
            key: 'ctrl + shift + plus',
            preventDefault: true,
            label: this.currentPageTitle,
            description: 'Toggle ViewMode',
            command: () => this.toggleViewMode(),
        },
    ];

    @ViewChild('detailsDrawer') detailsDrawer: MatDrawer;

    getStatusColorClass = getStatusColorClass;
    getBillingStatusColorClass = getBillingStatusColorClass;
    getCommissionStatusColorClass = getCommissionStatusColorClass;

    drawerFilterMode: 'over' | 'side' = 'side';
    drawerFilterOpened = true;

    drawerDetailMode: 'over' | 'side' = 'side';

    // viewMode: 'calendar' | 'list' = 'calendar';
    viewMode = 'list';

    flashMessage: 'success' | 'error' | null = null;

    results: PaginatedListResult<Service>;
    services: Service[] = [];
    itemsLoading = false;
    serviceSearchParameters: ServiceSearchParameters;
    currentService: Service;
    dateFrom: Date;
    dateTo: Date;

    activeLang: string;
    selectedItem: Service | null = null;
    selectedItemForm: UntypedFormGroup;

    serviceTypes = ServiceTypes;
    durationTypes = DurationTypes;

    trackByFn = trackByFn;

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
        setTimeout(() => {
            this.globalShortcutsService.addShortcuts(this.currentPageTitle, this._componentShortcuts);
        });
        this._changeDetectorRef.detectChanges();

        this.activeLang = this._translocoService.getActiveLang();

        // Services
        this._serviceService.list$.pipe(untilDestroyed(this)).subscribe((results: PaginatedListResult<Service>) => {
            this.results = results;
            this.services = results?.items;
        });

        // Services loading
        this._serviceService.loading$.pipe(untilDestroyed(this)).subscribe((servicesLoading: boolean) => {
            this.itemsLoading = servicesLoading;
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
        const toggleFilterValue = await this._userSettingsService.getValue(`${AppSettings.Calendar}:toggleFilter`);
        this.drawerFilterOpened = toggleFilterValue === '' ? false : toggleFilterValue === 'true';

        const toggleViewModeValue = await this._userSettingsService.getValue(`${AppSettings.Calendar}:toggleViewMode`);
        this.viewMode = toggleViewModeValue === '' ? 'calendar' : toggleViewModeValue;

        this.list();
    }

    ngOnDestroy(): void {
        this.globalShortcutsService.removeShortcuts(this.currentPageTitle);
    }

    async toggleViewMode() {
        return;

        this.viewMode = this.viewMode === 'calendar' ? 'list' : 'calendar';
        this._userSettingsService.setValue(`${AppSettings.Calendar}:toggleViewMode`, this.viewMode);
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

    private list(): void {
        this.serviceSearchParameters.pageIndex = 0;
        this.serviceSearchParameters.pageSize = 100;
        this.serviceSearchParameters.dateFrom = toUtcString(this.dateFrom);
        this.serviceSearchParameters.dateTo = toUtcString(this.dateTo);

        console.log('serviceSearchParameters', this.serviceSearchParameters);

        this._serviceService
            .listEntities({ ...this.serviceSearchParameters })
            .pipe(untilDestroyed(this))
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

                    // console.log('services', this.services);
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

    selectedService(service: Service) {
        // console.log('selectedService', service);
        this.currentService = service;
        this.detailsDrawer.toggle();
    }

    async toggleFilter() {
        this.drawerFilterOpened = !this.drawerFilterOpened;

        const value = this.drawerFilterOpened ? 'true' : 'false';
        this._userSettingsService.setValue(`${AppSettings.Calendar}:toggleFilter`, value);
    }

    handleEvents(events: EventApi[]) {
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
