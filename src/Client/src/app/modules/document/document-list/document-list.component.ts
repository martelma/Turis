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
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { trackByFn } from 'app/shared';
import { PaginatedListResult } from 'app/shared/services/shared.types';
import { SearchInputComponent } from 'app/shared/components/ui/search-input/search-input.component';
import { Document, DocumentSearchParameters } from '../document.types';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { BookmarkService } from 'app/modules/bookmark/bookmark.service';
import {
    DurationTypes,
    getDocumentStatusColorClass,
    getStatusColorClass,
    getStatusText,
    ServiceTypes,
    StatusTypes,
} from 'app/constants';
import { ServiceService } from 'app/modules/service/service.service';
import { DocumentService } from '../document.service';
import { UserSettingsService } from 'app/shared/services/user-setting.service';
import { DocumentComponent } from '../document.component';
import { TagSummaryComponent } from 'app/shared/components/tag-summary/tag-summary.component';

@UntilDestroy()
@Component({
    selector: 'app-document-list',
    templateUrl: './document-list.component.html',
    styleUrls: ['./document-list.component.scss'],
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
export class DocumentListComponent implements OnInit, AfterViewInit {
    @ViewChild('serviceList') serviceList: ElementRef;

    drawerFilterMode: 'over' | 'side' = 'side';
    drawerFilterOpened = false;

    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    statusTypes = StatusTypes;
    flashMessage: 'success' | 'error' | null = null;

    results: PaginatedListResult<Document>;
    list: Document[] = [];
    itemsLoading = false;
    documentParameters: DocumentSearchParameters;

    activeLang: string;
    selectedItem: Document;

    serviceTypes = ServiceTypes;
    durationTypes = DurationTypes;

    trackByFn = trackByFn;
    getStatusColorClass = getStatusColorClass;
    getStatusText = getStatusText;
    getDocumentStatusColorClass = getDocumentStatusColorClass;

    viewList = true;

    constructor(
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _serviceService: ServiceService,
        private _documentService: DocumentService,
        private _bookmarkService: BookmarkService,
        private _translocoService: TranslocoService,
        private _userSettingsService: UserSettingsService,

        public documentComponent: DocumentComponent,
    ) {
        this._documentService.viewList$.subscribe(value => {
            this.viewList = value;
        });
    }

    ngOnInit(): void {
        this.activeLang = this._translocoService.getActiveLang();

        // Document
        this._documentService.list$.pipe(untilDestroyed(this)).subscribe((results: PaginatedListResult<Document>) => {
            this.results = results;
            this.list = results?.items;
        });

        // Document loading
        this._documentService.loading$.pipe(untilDestroyed(this)).subscribe((documentsLoadin: boolean) => {
            this.itemsLoading = documentsLoadin;
        });

        // Service parameters
        this._documentService.parameters$
            .pipe(untilDestroyed(this))
            .subscribe((documentParameters: DocumentSearchParameters) => {
                this.documentParameters = documentParameters;
            });

        // Subscribe to service changes
        this._translocoService.langChanges$.pipe(untilDestroyed(this)).subscribe(activeLang => {
            // Get the active lang
            this.activeLang = activeLang;
        });

        this._subscribeDocumentParameters();
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

    private _subscribeDocumentParameters(): void {
        this._documentService.parameters$
            .pipe(untilDestroyed(this))
            .subscribe((documentParameters: DocumentSearchParameters) => {
                this.documentParameters = documentParameters;
            });
    }

    createDocument(): void {
        // console.log('createDocument');
        this._router.navigate(['./', 'new'], { relativeTo: this._activatedRoute });
    }

    toggleBookmarks(): void {
        this._search({
            onlyBookmarks: !this.documentParameters.onlyBookmarks,
            pageIndex: 0,
            pageSize: this._paginator.pageSize,
        });
    }

    private _search(documentParameters: DocumentSearchParameters): void {
        this._documentService
            .listEntities({ ...this.documentParameters, ...documentParameters })
            .pipe(untilDestroyed(this))
            .subscribe();
    }

    handleBookmark(document: Document): void {
        if (document.bookmarkId) {
            this._bookmarkService
                .delete(document.bookmarkId)
                .pipe(untilDestroyed(this))
                .subscribe(() => {
                    // Refresh the selected service
                    this._documentService.getById(document.id).pipe(untilDestroyed(this)).subscribe();

                    // Refresh the list
                    this._search({});
                });
        } else {
            this._bookmarkService
                .create({
                    entityName: 'Document',
                    entityId: document.id,
                })
                .pipe(untilDestroyed(this))
                .subscribe(() => {
                    // Refresh the selected service
                    this._documentService.getById(document.id).pipe(untilDestroyed(this)).subscribe();

                    // Refresh the list
                    this._search({});
                });
        }
    }

    navigateToItem(item: Document): void {
        item.selected = true;
        this._router.navigate(item.id ? ['.', item.id] : ['.', 'new'], { relativeTo: this._activatedRoute });
    }

    onItemSelected(document: Document): void {
        this.selectedItem = document;

        this.list.forEach(item => {
            item.selected = false;
        });

        this.selectedItem.selected = true;
    }

    handlePageEvent(event: PageEvent): void {
        this.documentParameters = { ...this.documentParameters, pageIndex: event.pageIndex, pageSize: event.pageSize };

        this._list();
    }

    private _list(): void {
        this._documentService
            .listEntities({ ...this.documentParameters })
            .pipe(untilDestroyed(this))
            .subscribe(items => {
                // if (items?.items?.length > 0) {
                //     this.navigateToItem(items.items[0]);
                // }
            });
    }

    filter(value: string): void {
        this.documentParameters = { pattern: value };
        this._list();
    }

    onServiceTypeChange() {}

    onDurationTypeChange() {}
}
