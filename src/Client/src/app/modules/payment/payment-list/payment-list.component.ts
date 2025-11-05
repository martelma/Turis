import {
    CommonModule,
    CurrencyPipe,
    DatePipe,
    JsonPipe,
    NgClass,
    NgFor,
    NgIf,
    NgStyle,
    NgTemplateOutlet,
} from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    Input,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { trackByFn } from 'app/shared';
import { PaginatedListResult } from 'app/shared/services/shared.types';
import { SearchInputComponent } from 'app/components/ui/search-input/search-input.component';
import { Payment, PaymentSearchParameters } from '../payment.types';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { BookmarkService } from 'app/modules/bookmark/bookmark.service';
import {
    AppSettings,
    DurationTypes,
    getStatusColorClass,
    getStatusText,
    ServiceTypes,
    StatusTypes,
} from 'app/constants';
import { PaymentService } from '../payment.service';
import { UserSettingsService } from 'app/shared/services/user-setting.service';
import { PaymentComponent } from '../payment.component';
import { TagSummaryComponent } from 'app/shared/components/tag-summary/tag-summary.component';
import { debounceTime, switchMap, Observable } from 'rxjs';

@UntilDestroy()
@Component({
    selector: 'app-payment-list',
    templateUrl: './payment-list.component.html',
    styleUrls: ['./payment-list.component.scss'],
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
        CommonModule,
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
        TagSummaryComponent,
    ],
})
export class PaymentListComponent implements OnInit, AfterViewInit {
    @Input() debounce = 500;
    // @ViewChild('serviceList') serviceList: ElementRef;

    drawerFilterMode: 'over' | 'side' = 'side';
    drawerFilterOpened = false;

    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    statusTypes = StatusTypes;
    flashMessage: 'success' | 'error' | null = null;

    results: PaginatedListResult<Payment>;
    list: Payment[] = [];
    itemsLoading = false;
    searchControl = new FormControl('');
    paymentParameters: PaymentSearchParameters;

    activeLang: string;
    selectedItem: Payment;

    serviceTypes = ServiceTypes;
    durationTypes = DurationTypes;

    trackByFn = trackByFn;
    getStatusColorClass = getStatusColorClass;
    getStatusText = getStatusText;

    viewList = true;

    constructor(
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _paymentService: PaymentService,
        private _bookmarkService: BookmarkService,
        private _translocoService: TranslocoService,
        private _userSettingsService: UserSettingsService,

        public paymentComponent: PaymentComponent,
    ) {
        this._paymentService.viewList$.subscribe(value => {
            console.log('PaymentListComponent viewList$', value);
            this.viewList = value;
            this._changeDetectorRef.markForCheck();
        });
    }

    ngOnInit(): void {
        this.activeLang = this._translocoService.getActiveLang();

        // Payment
        this._paymentService.list$.pipe(untilDestroyed(this)).subscribe((results: PaginatedListResult<Payment>) => {
            this.results = results;
            this.list = results?.items;
        });

        // Payment loading
        this._paymentService.loading$.pipe(untilDestroyed(this)).subscribe((paymentsLoadin: boolean) => {
            this.itemsLoading = paymentsLoadin;
        });

        // Service parameters
        this._paymentService.parameters$
            .pipe(untilDestroyed(this))
            .subscribe((paymentParameters: PaymentSearchParameters) => {
                this.paymentParameters = paymentParameters;
            });

        // Subscribe to service changes
        this._translocoService.langChanges$.pipe(untilDestroyed(this)).subscribe(activeLang => {
            // Get the active lang
            this.activeLang = activeLang;
        });

        this._subscribeSearchControlChanges();

        this._subscribePaymentParameters();
    }

    async ngAfterViewInit(): Promise<void> {
        this.viewList = await this._userSettingsService.getBooleanValue(`${AppSettings.Payment}:viewList`, true);

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

    private _subscribeSearchControlChanges(): void {
        this.searchControl.valueChanges
            .pipe(
                debounceTime(this.debounce),
                switchMap(value => this._search({ pattern: value, pageIndex: 0 })),
                untilDestroyed(this),
            )
            .subscribe();
    }

    private _subscribePaymentParameters(): void {
        this._paymentService.parameters$
            .pipe(untilDestroyed(this))
            .subscribe((paymentParameters: PaymentSearchParameters) => {
                this.paymentParameters = paymentParameters;
            });
    }

    createPayment(): void {
        // console.log('createPayment');
        this._router.navigate(['./', 'new'], { relativeTo: this._activatedRoute });
    }

    toggleBookmarks(): void {
        this._search({
            onlyBookmarks: !this.paymentParameters.onlyBookmarks,
            pageIndex: 0,
            pageSize: this._paginator.pageSize,
        }).subscribe();
    }

    private _search(paymentParameters: PaymentSearchParameters): Observable<PaginatedListResult<Payment>> {
        return this._paymentService
            .listEntities({ ...this.paymentParameters, ...paymentParameters })
            .pipe(untilDestroyed(this));
    }

    handleBookmark(payment: Payment): void {
        if (payment.bookmarkId) {
            this._bookmarkService
                .delete(payment.bookmarkId)
                .pipe(untilDestroyed(this))
                .subscribe(() => {
                    // Refresh the selected service
                    this._paymentService.getById(payment.id).pipe(untilDestroyed(this)).subscribe();

                    // Refresh the list
                    this._search({}).subscribe();
                });
        } else {
            this._bookmarkService
                .create({
                    entityName: 'Payment',
                    entityId: payment.id,
                })
                .pipe(untilDestroyed(this))
                .subscribe(() => {
                    // Refresh the selected service
                    this._paymentService.getById(payment.id).pipe(untilDestroyed(this)).subscribe();

                    // Refresh the list
                    this._search({}).subscribe();
                });
        }
    }

    navigateToItem(item: Payment): void {
        item.selected = true;
        this._router.navigate(item.id ? ['.', item.id] : ['.', 'new'], { relativeTo: this._activatedRoute });
    }

    onItemSelected(payment: Payment): void {
        this.selectedItem = payment;

        this.list.forEach(item => {
            item.selected = false;
        });

        this.selectedItem.selected = true;
    }

    handlePageEvent(event: PageEvent): void {
        this.paymentParameters = { ...this.paymentParameters, pageIndex: event.pageIndex, pageSize: event.pageSize };

        this._list();
    }

    private _list(): void {
        this._paymentService
            .listEntities({ ...this.paymentParameters })
            .pipe(untilDestroyed(this))
            .subscribe(items => {
                // if (items?.items?.length > 0) {
                //     this.navigateToItem(items.items[0]);
                // }
            });
    }

    filter(value: string): void {
        this.paymentParameters = { pattern: value };
        this._list();
    }

    onServiceTypeChange() {}

    onDurationTypeChange() {}
}
