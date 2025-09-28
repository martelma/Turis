import { NgIf, NgFor, NgClass, NgStyle, CurrencyPipe, NgTemplateOutlet, JsonPipe, CommonModule } from '@angular/common';
import {
    Component,
    ViewEncapsulation,
    OnInit,
    AfterViewInit,
    ViewChild,
    ChangeDetectorRef,
    Input,
    EventEmitter,
    Output,
    OnDestroy,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { fuseAnimations } from '@fuse/animations';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { UntilDestroy } from '@ngneat/until-destroy';
import { getStatusColorClass, getBillingStatusColorClass, getCommissionStatusColorClass } from 'app/constants';
import { MaterialModule } from 'app/modules/material.module';
import { ServiceSidebarComponent } from 'app/modules/service/service-sidebar/service-sidebar.component';
import { ServiceService } from 'app/modules/service/service.service';
import { Service, ServiceSearchParameters } from 'app/modules/service/service.types';
import { trackByFn } from 'app/shared';
import { SearchInputComponent } from 'app/components/global-shortcuts/ui/search-input/search-input.component';
import { PaginatedListResult } from 'app/shared/services/shared.types';
import { UserSettingsService } from 'app/shared/services/user-setting.service';
import { CalendarSelectorComponent } from '../calendar-selector/calendar-selector.component';
import { CalendarDetailComponent } from '../calendar-detail/calendar-detail.component';
import { GlobalShortcutsService } from 'app/components/global-shortcuts/global-shortcuts.service';
import { KeyboardShortcutsModule } from 'ng-keyboard-shortcuts';

declare let $: any;

@UntilDestroy()
@Component({
    selector: 'app-calendar-view-grid',
    templateUrl: './calendar-view-grid.component.html',
    styleUrls: ['./calendar-view-grid.component.scss'],
    styles: [
        `
            .list-grid {
                grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
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
        CalendarSelectorComponent,
        CalendarDetailComponent,
        KeyboardShortcutsModule,
    ],
})
export class CalendarViewGridComponent implements OnInit, OnDestroy, AfterViewInit {
    currentPageTitle = 'Calendar';
    private _componentShortcuts = [
        // {
        //     key: 'ctrl + shift + -',
        //     preventDefault: true,
        //     label: this.currentPageTitle,
        //     description: 'Collapse all',
        //     command: () => this.collapseAll(),
        // },
        // {
        //     key: 'ctrl + shift + plus',
        //     preventDefault: true,
        //     label: this.currentPageTitle,
        //     description: 'Expand all',
        //     command: () => this.expandAll(),
        // },
        // {
        //     key: 'ctrl + alt + plus',
        //     preventDefault: true,
        //     label: this.currentPageTitle,
        //     description: 'Add Production Batch',
        //     command: () => this.addProductionBatch(),
        // },
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

    @ViewChild(CalendarSelectorComponent) private _calendarSelector: CalendarSelectorComponent;
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

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
    }

    @Output() readonly onSelectedService: EventEmitter<Service> = new EventEmitter<Service>();
    @Output() readonly onDateChanged: EventEmitter<void> = new EventEmitter<void>();

    getStatusColorClass = getStatusColorClass;
    getBillingStatusColorClass = getBillingStatusColorClass;
    getCommissionStatusColorClass = getCommissionStatusColorClass;

    trackByFn = trackByFn;

    currentDate: Date = new Date();

    itemsLoading = false;
    parameters: ServiceSearchParameters;
    results: PaginatedListResult<Service>;

    selectedItem: Service;

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
        public globalShortcutsService: GlobalShortcutsService,
    ) {}

    ngOnInit(): void {
        this.globalShortcutsService.addShortcuts(this.currentPageTitle, this._componentShortcuts);
    }

    ngAfterViewInit(): void {
        if (!this.dateFrom) {
            this.setDates();
        }
    }

    ngOnDestroy(): void {
        setTimeout(() => {
            this.globalShortcutsService.addShortcuts(this.currentPageTitle, this._componentShortcuts);
        });
        this._changeDetectorRef.detectChanges();
    }

    handlePageEvent(event: PageEvent): void {}

    handleItem(item: Service) {
        this.selectedItem = item;
        // console.log('selectedItem', this.selectedItem);
        this.onSelectedService.emit(this.selectedItem);
    }

    setNextDay() {
        this._calendarSelector.next();
    }

    setPreviousDay() {
        this._calendarSelector.previous();
    }

    dateChanged(date: Date) {
        // console.log('dateChanged', date);
        this.currentDate = new Date(date);
        this.setDates();
    }

    setDates() {
        this.dateFrom = new Date(this.currentDate);
        this.dateFromChange.emit(this.dateFrom);

        this.dateTo = new Date(this.currentDate);
        this.dateTo.setDate(this.dateTo.getDate() + 1);
        this.dateToChange.emit(this.dateTo);

        this.onDateChanged.emit();
    }

    /*
    listData() {
        const dateTo = new Date();
        dateTo.setDate(this.currentDate.getDate() + 1);

        const parameters = new ServiceSearchParameters();
        parameters.dateFrom = toUtcString(this.currentDate);
        parameters.dateTo = toUtcString(dateTo);

        console.log('parameters', parameters);

        this._serviceService
            .listEntities({ ...parameters })
            .pipe(untilDestroyed(this))
            .subscribe({
                next: (data: PaginatedListResult<Service>) => {
                    this.results = data;
                    console.log('results', this.results.items);
                    this.services = data.items;

                    // this.list.forEach(item => {
                    //     if (item.collaborator) {
                    //         item.collaborator.avatarUrl = item.collaborator.avatar
                    //             ? this._sanitizer.bypassSecurityTrustResourceUrl(
                    //                   `data:image/jpg;base64, ${item.collaborator.avatar}`,
                    //               )
                    //             : undefined;

                    //         item.collaborator.avatarUrl2 = this._sanitizer.bypassSecurityTrustUrl(
                    //             item.collaborator?.avatar,
                    //         );
                    //     }
                    // });

                    console.log('_list', this.services);
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
    */

    async drawerDetailsChanged(opened: boolean): Promise<void> {
        if (!opened) {
            this.selectedItem = null;
        }

        this._changeDetectorRef.detectChanges();
    }
}
