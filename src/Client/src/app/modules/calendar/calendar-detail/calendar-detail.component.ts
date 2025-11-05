import { CommonModule, CurrencyPipe, JsonPipe, NgClass, NgFor, NgIf, NgStyle, NgTemplateOutlet } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
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
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { UntilDestroy } from '@ngneat/until-destroy';
import { trackByFn } from 'app/shared';
import { PaginatedListResult } from 'app/shared/services/shared.types';
import { SearchInputComponent } from 'app/components/ui/search-input/search-input.component';
import { Service, ServiceSearchParameters } from 'app/modules/service/service.types';
import { MaterialModule } from 'app/modules/material.module';
import { FullCalendarModule } from '@fullcalendar/angular';
import {
    DurationTypes,
    getBillingStatusColorClass,
    getCommissionStatusColorClass,
    getStatusColorClass,
    getWorkflowCollaboratorStatusColorClass,
    ServiceTypes,
} from 'app/constants';
import { ServiceSidebarComponent } from 'app/modules/service/service-sidebar/service-sidebar.component';
import { MatDrawer } from '@angular/material/sidenav';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { CalendarViewGridComponent } from '../calendar-view-grid/calendar-view-grid.component';
import { TagSummaryComponent } from 'app/shared/components/tag-summary/tag-summary.component';

@UntilDestroy()
@Component({
    selector: 'app-calendar-detail',
    templateUrl: './calendar-detail.component.html',
    styleUrls: ['./calendar-detail.component.scss'],
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
        TagSummaryComponent,
    ],
})
export class CalendarDetailComponent implements OnInit {
    // Stato hover per ogni riga della sezione Information
    infoRowHover: boolean[] = Array(10).fill(false);
    @ViewChild('detailsDrawer') detailsDrawer: MatDrawer;

    @Input() service: Service;
    @Output() onCloseDrawer: EventEmitter<void> = new EventEmitter<void>();

    getStatusColorClass = getStatusColorClass;
    getBillingStatusColorClass = getBillingStatusColorClass;
    getCommissionStatusColorClass = getCommissionStatusColorClass;
    getWorkflowCollaboratorStatusColorClass = getWorkflowCollaboratorStatusColorClass;

    drawerFilterMode: 'over' | 'side' = 'side';
    drawerFilterOpened = true;

    drawerDetailMode: 'over' | 'side' = 'side';

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

    clientInfoBg = false;

    trackByFn = trackByFn;

    constructor(private _translocoService: TranslocoService) {}

    async ngOnInit(): Promise<void> {
        this.activeLang = this._translocoService.getActiveLang();
    }

    closeDrawer(): void {
        this.onCloseDrawer.emit();
    }
}
