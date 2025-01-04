import { CurrencyPipe, DatePipe, JsonPipe, NgClass, NgFor, NgIf, NgStyle, NgTemplateOutlet } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { trackByFn } from 'app/shared';
import { PaginatedListResult } from 'app/shared/services/shared.types';
import { SearchInputComponent } from 'app/shared/components/ui/search-input/search-input.component';
import { Service, ServiceSearchParameters } from '../service.types';
import { ServiceService } from '../service.service';
import { ServiceComponent } from '../service.component';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { BookmarkService } from 'app/modules/bookmark/bookmark.service';
import { DurationTypes, getStatusColorClass, getStatusText, ServiceTypes, StatusTypes } from 'app/constants';
import { UserService } from 'app/core/user/user.service';
import { ServiceViewComponent } from '../service-view/service-view.component';

@UntilDestroy()
@Component({
    selector: 'app-service-list',
    templateUrl: './service-list.component.html',
    styleUrls: ['./service-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        NgStyle,
        CurrencyPipe,
        DatePipe,
        JsonPipe,
        FormsModule,
        ReactiveFormsModule,
        RouterOutlet,
        RouterLink,
        MatProgressBarModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatMenuModule,
        MatSortModule,
        MatTooltipModule,
        NgTemplateOutlet,
        MatPaginatorModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatOptionModule,
        MatCheckboxModule,
        MatRippleModule,
        TranslocoModule,
        SearchInputComponent,
        ServiceComponent,
        ServiceViewComponent,
    ],
})
export class ServiceListComponent implements OnInit, AfterViewInit {
    @ViewChild('serviceList') serviceList: ElementRef;

    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    statusTypes = StatusTypes;
    flashMessage: 'success' | 'error' | null = null;

    results: PaginatedListResult<Service>;
    list: Service[] = [];
    itemsLoading = false;
    serviceParameters: ServiceSearchParameters;

    activeLang: string;
    selectedItem: Service;
    // selectedItemForm: UntypedFormGroup;

    serviceTypes = ServiceTypes;
    durationTypes = DurationTypes;

    trackByFn = trackByFn;
    getStatusColorClass = getStatusColorClass;
    getStatusText = getStatusText;

    constructor(
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _userService: UserService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _serviceService: ServiceService,
        private _bookmarkService: BookmarkService,
        private _translocoService: TranslocoService,

        public serviceComponent: ServiceComponent,
    ) { }

    ngOnInit(): void {
        this.activeLang = this._translocoService.getActiveLang();

        // Create the selected service form
        // this.selectedItemForm = this._formBuilder.group({
        //     id: [''],
        //     code: ['', [Validators.required]],
        //     name: ['', [Validators.required]],
        //     serviceType: [''],
        //     durationType: [''],
        //     maxCount: [''],
        //     price: [''],
        //     priceExtra: [''],
        // });

        // Services
        this._serviceService.services$.pipe(untilDestroyed(this)).subscribe((results: PaginatedListResult<Service>) => {
            this.results = results;
            this.list = results?.items;

            this.list.forEach(item => {
                item.languages = item.languages.map(lang => lang.toLowerCase());
            });
        });

        // Services loading
        this._serviceService.servicesLoading$.pipe(untilDestroyed(this)).subscribe((servicesLoading: boolean) => {
            this.itemsLoading = servicesLoading;
        });

        // Service parameters
        this._serviceService.serviceParameters$
            .pipe(untilDestroyed(this))
            .subscribe((serviceParameters: ServiceSearchParameters) => {
                this.serviceParameters = serviceParameters;
            });

        // Subscribe to service changes
        this._translocoService.langChanges$.pipe(untilDestroyed(this)).subscribe(activeLang => {
            // Get the active lang
            this.activeLang = activeLang;
        });

        this._subscribeServiceParameters();
    }

    ngAfterViewInit(): void {
        if (this._sort && this._paginator) {
            // Set the initial sort
            this._sort.sort({
                id: 'name',
                start: 'asc',
                disableClear: true,
            });

            // Mark for check
            this._changeDetectorRef.markForCheck();

            // If the user changes the sort order...
            this._sort.sortChange.pipe(untilDestroyed(this)).subscribe(() => {
                // Reset back to the first page
                this._paginator.pageIndex = 0;

                // Close the details
                // this.closeDetails();
            });
        }
        this._list();
    }

    private _subscribeServiceParameters(): void {
        this._serviceService.serviceParameters$
            .pipe(untilDestroyed(this))
            .subscribe((serviceParameters: ServiceSearchParameters) => {
                this.serviceParameters = serviceParameters;
            });
    }

    createService(): void {
        console.log('createService');
        this._router.navigate(['./', 'new'], { relativeTo: this._activatedRoute });
    }

    toggleBookmarks(): void {
        this._search({
            onlyBookmarks: !this.serviceParameters.onlyBookmarks,
            pageIndex: 0,
            pageSize: this._paginator.pageSize,
        });
    }

    private _search(serviceParameters: ServiceSearchParameters): void {
        this._serviceService
            .listEntities({ ...this.serviceParameters, ...serviceParameters })
            .pipe(untilDestroyed(this))
            .subscribe();
    }

    handleBookmark(service: Service): void {
        if (service.bookmarkId) {
            this._bookmarkService
                .delete(service.bookmarkId)
                .pipe(untilDestroyed(this))
                .subscribe(() => {
                    // Refresh the selected service
                    this._serviceService.getById(service.id).pipe(untilDestroyed(this)).subscribe();

                    // Refresh the list
                    this._search({});
                });
        } else {
            this._bookmarkService
                .create({
                    entityName: 'Service',
                    entityId: service.id,
                })
                .pipe(untilDestroyed(this))
                .subscribe(() => {
                    // Refresh the selected service
                    this._serviceService.getById(service.id).pipe(untilDestroyed(this)).subscribe();

                    // Refresh the list
                    this._search({});
                });
        }
    }

    handleCheck(service: Service): void {
        if (service.checked) {
            this._serviceService.setCheck(service);
        } else {
            this._serviceService.setUnCheck(service);
        }
    }

    onItemSelected(service: Service): void {
        this.selectedItem = service;

        console.log('selectedItem', this.selectedItem);
    }

    handlePageEvent(event: PageEvent): void {
        this.serviceParameters = { ...this.serviceParameters, pageIndex: event.pageIndex, pageSize: event.pageSize };

        this._list();
    }

    private _list(): void {
        this._serviceService
            .listEntities({ ...this.serviceParameters })
            .pipe(untilDestroyed(this))
            .subscribe();
    }

    filter(value: string): void {
        this.serviceParameters = { pattern: value };
        this._list();
    }

    onServiceTypeChange() { }

    onDurationTypeChange() { }
}
