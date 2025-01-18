import { JournalEntry, JournalEntrySearchParameters } from './../journal-entry.types';
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
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { BookmarkService } from 'app/modules/bookmark/bookmark.service';
import { UserSettingsService } from 'app/shared/services/user-setting.service';
import { JournalEntryComponent } from '../journal-entry.component';
import { JournalEntryService } from '../journal-entry.service';

@UntilDestroy()
@Component({
    selector: 'app-journal-entry-list',
    templateUrl: './journal-entry-list.component.html',
    styleUrls: ['./journal-entry-list.component.scss'],
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
    ],
})
export class JournalEntryListComponent implements OnInit, AfterViewInit {
    @ViewChild('serviceList') serviceList: ElementRef;

    drawerFilterMode: 'over' | 'side' = 'side';
    drawerFilterOpened = false;

    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    flashMessage: 'success' | 'error' | null = null;

    results: PaginatedListResult<JournalEntry>;
    list: JournalEntry[] = [];
    itemsLoading = false;
    journalEntryParameters: JournalEntrySearchParameters;

    activeLang: string;
    selectedItem: JournalEntry;

    trackByFn = trackByFn;

    constructor(
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _journalEntryService: JournalEntryService,
        private _bookmarkService: BookmarkService,
        private _translocoService: TranslocoService,
        private _userSettingsService: UserSettingsService,

        public journalEntryComponent: JournalEntryComponent,
    ) {}

    ngOnInit(): void {
        this.activeLang = this._translocoService.getActiveLang();

        // JournalEntry
        this._journalEntryService.journalEntries$
            .pipe(untilDestroyed(this))
            .subscribe((results: PaginatedListResult<JournalEntry>) => {
                this.results = results;
                this.list = results?.items;
            });

        // JournalEntry loading
        this._journalEntryService.journalEntriesLoading$
            .pipe(untilDestroyed(this))
            .subscribe((journalEntriesLoading: boolean) => {
                this.itemsLoading = journalEntriesLoading;
            });

        // Service parameters
        this._journalEntryService.journalEntryParameters$
            .pipe(untilDestroyed(this))
            .subscribe((journalEntryParameters: JournalEntrySearchParameters) => {
                this.journalEntryParameters = journalEntryParameters;
            });

        // Subscribe to service changes
        this._translocoService.langChanges$.pipe(untilDestroyed(this)).subscribe(activeLang => {
            // Get the active lang
            this.activeLang = activeLang;
        });

        this._subscribeJournalEntryParameters();
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

    private _subscribeJournalEntryParameters(): void {
        this._journalEntryService.journalEntryParameters$
            .pipe(untilDestroyed(this))
            .subscribe((journalEntryParameters: JournalEntrySearchParameters) => {
                this.journalEntryParameters = journalEntryParameters;
            });
    }

    createJournalEntry(): void {
        console.log('createJournalEntry');
        this._router.navigate(['./', 'new'], { relativeTo: this._activatedRoute });
    }

    toggleBookmarks(): void {
        this._search({
            onlyBookmarks: !this.journalEntryParameters.onlyBookmarks,
            pageIndex: 0,
            pageSize: this._paginator.pageSize,
        });
    }

    private _search(journalEntryParameters: JournalEntrySearchParameters): void {
        this._journalEntryService
            .listEntities({ ...this.journalEntryParameters, ...journalEntryParameters })
            .pipe(untilDestroyed(this))
            .subscribe();
    }

    handleBookmark(journalEntries: JournalEntry): void {
        if (journalEntries.bookmarkId) {
            this._bookmarkService
                .delete(journalEntries.bookmarkId)
                .pipe(untilDestroyed(this))
                .subscribe(() => {
                    // Refresh the selected service
                    this._journalEntryService.getById(journalEntries.id).pipe(untilDestroyed(this)).subscribe();

                    // Refresh the list
                    this._search({});
                });
        } else {
            this._bookmarkService
                .create({
                    entityName: 'JournalEntry',
                    entityId: journalEntries.id,
                })
                .pipe(untilDestroyed(this))
                .subscribe(() => {
                    // Refresh the selected service
                    this._journalEntryService.getById(journalEntries.id).pipe(untilDestroyed(this)).subscribe();

                    // Refresh the list
                    this._search({});
                });
        }
    }

    onItemSelected(journalEntries: JournalEntry): void {
        this.selectedItem = journalEntries;

        console.log('selectedItem', this.selectedItem);
    }

    handlePageEvent(event: PageEvent): void {
        this.journalEntryParameters = {
            ...this.journalEntryParameters,
            pageIndex: event.pageIndex,
            pageSize: event.pageSize,
        };

        this._list();
    }

    private _list(): void {
        this._journalEntryService
            .listEntities({ ...this.journalEntryParameters })
            .pipe(untilDestroyed(this))
            .subscribe();
    }

    filter(value: string): void {
        this.journalEntryParameters = { pattern: value };
        this._list();
    }

    onServiceTypeChange() {}

    onDurationTypeChange() {}
}
