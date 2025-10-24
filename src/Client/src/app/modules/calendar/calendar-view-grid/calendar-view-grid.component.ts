import {
    NgIf,
    NgFor,
    NgClass,
    NgStyle,
    CurrencyPipe,
    NgTemplateOutlet,
    JsonPipe,
    CommonModule,
    DatePipe,
} from '@angular/common';
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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { fuseAnimations } from '@fuse/animations';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { TranslocoModule } from '@ngneat/transloco';
import { UntilDestroy } from '@ngneat/until-destroy';
import { getStatusColorClass, getBillingStatusColorClass, getCommissionStatusColorClass } from 'app/constants';
import { MaterialModule } from 'app/modules/material.module';
import { ServiceSidebarComponent } from 'app/modules/service/service-sidebar/service-sidebar.component';
import { Service, ServiceSearchParameters } from 'app/modules/service/service.types';
import { trackByFn } from 'app/shared';
import { SearchInputComponent } from 'app/components/ui/search-input/search-input.component';
import { PaginatedListResult } from 'app/shared/services/shared.types';
import { CalendarSelectorComponent } from '../calendar-selector/calendar-selector.component';
import { CalendarDetailComponent } from '../calendar-detail/calendar-detail.component';
import { GlobalShortcutsService } from 'app/components/ui/global-shortcuts/global-shortcuts.service';
import { KeyboardShortcutsModule } from 'ng-keyboard-shortcuts';
import { CalendarBadgesComponent } from 'app/components/ui/calendar-badges/calendar-badges.component';
import { FuseCardComponent } from '@fuse/components/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { TagSummaryComponent } from 'app/shared/components/tag-summary/tag-summary.component';

@UntilDestroy()
@Component({
    selector: 'app-calendar-view-grid',
    templateUrl: './calendar-view-grid.component.html',
    styleUrls: ['./calendar-view-grid.component.scss'],
    styles: [
        `
            .list-grid {
                grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
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
        DatePipe,
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
        MatTabsModule,
        MatTableModule,
        MatMenuModule,
        MatBadgeModule,
        TranslocoModule,
        CalendarSelectorComponent,
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
        CalendarBadgesComponent,
        FuseCardComponent,
        TagSummaryComponent,
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

    calendarEvents = new Map<string, number>([]);

    @ViewChild(CalendarSelectorComponent) private _calendarSelector: CalendarSelectorComponent;

    @Input() dateFrom: Date;
    @Output() dateFromChange = new EventEmitter<Date>();
    @Input() dateTo: Date;
    @Output() dateToChange = new EventEmitter<Date>();

    private _services: Service[] = [];
    dataSource: any;
    @Input()
    get services(): Service[] {
        return this._services;
    }

    set services(services: Service[]) {
        this._services = services;

        setTimeout(async () => {
            this.dataSource = new MatTableDataSource(this._services);
        }, 0);

        // Raggruppa i servizi per data e conta quanti ce ne sono per ogni data
        this.calendarEvents = this._services.reduce((map, item) => {
            const dateKey = item.date.toISOString().split('T')[0]; // Converte la data in formato 'YYYY-MM-DD'
            const currentCount = map.get(dateKey) || 0;
            map.set(dateKey, currentCount + 1);
            return map;
        }, new Map());
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

    columnsToDisplay: string[] = [
        'status',
        'tags',
        'date',
        'serviceType',
        'durationType',
        'people',
        'languages',
        'title',
        'client',
        'collaborator',
    ];

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
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

    handlePageEvent(): void {}

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

    async drawerDetailsChanged(opened: boolean): Promise<void> {
        if (!opened) {
            this.selectedItem = null;
        }

        this._changeDetectorRef.detectChanges();
    }
}
