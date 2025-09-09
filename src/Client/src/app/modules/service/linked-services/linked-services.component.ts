import { AfterViewInit, Component, Input, OnChanges, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslocoModule } from '@ngneat/transloco';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { FuseScrollResetDirective } from '@fuse/directives/scroll-reset';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { DatePipe, JsonPipe, NgFor, NgIf, NgClass, TitleCasePipe } from '@angular/common';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ServiceService } from '../service.service';
import { Service, ServiceSearchParameters } from '../service.types';
import { MatExpansionModule } from '@angular/material/expansion';
import { Router, RouterLink } from '@angular/router';
import { Contact } from 'app/modules/contact/contact.types';
import { AttachmentsComponent } from 'app/shared/components/attachments/attachments.component';
import { EventLogsGridComponent } from 'app/modules/event-logs/grid/event-logs-grid.component';
import { EventLogsComponent } from 'app/modules/event-logs/event-logs/event-logs.component';
import { LinkedService } from '../linkedService';
import { SearchInputComponent } from 'app/shared/components/ui/search-input/search-input.component';
import { PaginatedListResult } from 'app/shared/services/shared.types';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { getStatusColorClass, getStatusText } from 'app/constants';
import { trackByFn } from 'app/shared';

@UntilDestroy()
@Component({
    selector: 'app-linked-services',
    templateUrl: './linked-services.component.html',
    styleUrls: ['./linked-services.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        DatePipe,
        JsonPipe,
        TitleCasePipe,
        RouterLink,
        FormsModule,
        ReactiveFormsModule,
        MatTabsModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatExpansionModule,
        MatProgressBarModule,
        MatPaginatorModule,
        MatSortModule,
        FuseScrollResetDirective,
        TranslocoModule,
        AttachmentsComponent,
        EventLogsComponent,
        EventLogsGridComponent,
        SearchInputComponent,
    ],
})
export class LinkedServicesComponent implements OnInit, AfterViewInit, OnChanges {
    loading = false;
    @Input() serviceId: string;
    @Input() edit = false;

    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    @ViewChild(SearchInputComponent) private searchInput: SearchInputComponent;

    serviceParameters: ServiceSearchParameters;
    results: PaginatedListResult<Service>;
    list: Service[] = [];
    itemsLoading = false;

    data: LinkedService;

    trackByFn = trackByFn;
    getStatusColorClass = getStatusColorClass;
    getStatusText = getStatusText;

    constructor(
        private formBuilder: UntypedFormBuilder,
        private serviceService: ServiceService,
        private router: Router,
    ) {}

    ngOnChanges(): void {}

    ngOnInit(): void {}

    ngAfterViewInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.serviceService.linkedServices(this.serviceId).subscribe(linkedServices => {
            this.data = linkedServices;
            console.log(linkedServices);

            this.searchInput?.reset();
            this.results = null;
        });
    }

    openContact(contact: Contact) {
        const url = this.router.serializeUrl(this.router.createUrlTree(['/contact', contact?.id]));
        window.open(url, '_blank');
    }

    filter(value: string): void {
        this.serviceParameters = { pattern: value };
        this.filterServices();
    }

    private filterServices(): void {
        this.serviceService
            .filterEntities({ ...this.serviceParameters })
            .pipe(untilDestroyed(this))
            .subscribe(data => {
                this.serviceParameters.pageIndex = data.pageIndex;
                this.serviceParameters.pageSize = data.pageSize;
                this.results = data;
                // console.log(this.results);
            });
    }

    handlePageEvent(event: PageEvent): void {
        this.serviceParameters = { ...this.serviceParameters, pageIndex: event.pageIndex, pageSize: event.pageSize };

        this.filterServices();
    }

    enableAddTargetService(): boolean {
        return !this.data?.targetServices;
    }

    addTargetService(targetId: string) {
        console.log('Add Target Service', this.serviceId, targetId);
        this.serviceService
            .addTargetService(this.serviceId, targetId)
            .pipe(untilDestroyed(this))
            .subscribe(data => {
                this.loadData();
            });
    }

    addSourceService(sourceId: string) {
        console.log('Add Source Service', this.serviceId, sourceId);
        this.serviceService
            .addSourceService(this.serviceId, sourceId)
            .pipe(untilDestroyed(this))
            .subscribe(data => {
                this.loadData();
            });
    }
}
