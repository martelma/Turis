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
    Input,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
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
import { SearchInputComponent } from 'app/components/ui/search-input/search-input.component';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { BookmarkService } from 'app/modules/bookmark/bookmark.service';
import { JournalEntryComponent } from '../journal-entry.component';
import { JournalEntryService } from '../journal-entry.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TagListComponent } from 'app/modules/configuration/tags/tag-list/tag-list.component';
import { TagSummaryComponent } from 'app/shared/components/tag-summary/tag-summary.component';
import { debounceTime, switchMap, Observable } from 'rxjs';

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
        TagSummaryComponent,
    ],
})
export class JournalEntryListComponent implements OnInit, AfterViewInit {
    @Input() debounce = 500;
    @ViewChild('serviceList') serviceList: ElementRef;

    drawerFilterMode: 'over' | 'side' = 'side';
    drawerFilterOpened = false;

    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    flashMessage: 'success' | 'error' | null = null;

    results: PaginatedListResult<JournalEntry>;
    list: JournalEntry[] = [];
    itemsLoading = false;
    searchControl = new FormControl('');
    journalEntryParameters: JournalEntrySearchParameters;

    activeLang: string;
    selectedItem: JournalEntry;
    selectedItemForm: UntypedFormGroup;

    trackByFn = trackByFn;

    constructor(
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _journalEntryService: JournalEntryService,
        private _bookmarkService: BookmarkService,
        private _translocoService: TranslocoService,

        public journalEntryComponent: JournalEntryComponent,
    ) {}

    ngOnInit(): void {
        this.activeLang = this._translocoService.getActiveLang();

        // JournalEntry
        this._journalEntryService.list$
            .pipe(untilDestroyed(this))
            .subscribe((results: PaginatedListResult<JournalEntry>) => {
                this.results = results;
                this.list = results?.items;
            });

        // JournalEntry loading
        this._journalEntryService.loading$.pipe(untilDestroyed(this)).subscribe((journalEntriesLoading: boolean) => {
            this.itemsLoading = journalEntriesLoading;
        });

        // Service parameters
        this._journalEntryService.parameters$
            .pipe(untilDestroyed(this))
            .subscribe((journalEntryParameters: JournalEntrySearchParameters) => {
                this.journalEntryParameters = journalEntryParameters;
            });

        // Subscribe to service changes
        this._translocoService.langChanges$.pipe(untilDestroyed(this)).subscribe(activeLang => {
            // Get the active lang
            this.activeLang = activeLang;
        });

        this._subscribeSearchControlChanges();

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

    private _subscribeSearchControlChanges(): void {
        this.searchControl.valueChanges
            .pipe(
                debounceTime(this.debounce),
                switchMap(value => this._search({ pattern: value, pageIndex: 0 })),
                untilDestroyed(this),
            )
            .subscribe();
    }

    private _subscribeJournalEntryParameters(): void {
        this._journalEntryService.parameters$
            .pipe(untilDestroyed(this))
            .subscribe((journalEntryParameters: JournalEntrySearchParameters) => {
                this.journalEntryParameters = journalEntryParameters;
            });
    }

    toggleBookmarks(): void {
        this._search({
            onlyBookmarks: !this.journalEntryParameters.onlyBookmarks,
            pageIndex: 0,
            pageSize: this._paginator.pageSize,
        }).subscribe();
    }

    private _search(
        journalEntryParameters: JournalEntrySearchParameters,
    ): Observable<PaginatedListResult<JournalEntry>> {
        return this._journalEntryService
            .listEntities({ ...this.journalEntryParameters, ...journalEntryParameters })
            .pipe(untilDestroyed(this));
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
                    this._search({}).subscribe();
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
                    this._search({}).subscribe();
                });
        }
    }

    navigateToItem(item: JournalEntry): void {
        item.selected = true;
        this._router.navigate(item.id ? ['.', item.id] : ['.', 'new'], { relativeTo: this._activatedRoute });
    }

    onItemSelected(journalEntries: JournalEntry): void {
        this.selectedItem = journalEntries;

        this.list.forEach(item => {
            item.selected = false;
        });

        this.selectedItem.selected = true;
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
            .subscribe(items => {
                // if (items?.items?.length > 0) {
                //     this.navigateToItem(items.items[0]);
                // }
            });
    }

    filter(value: string): void {
        this.journalEntryParameters = { pattern: value };
        this._list();
    }

    createJournalEntry(): void {
        // console.log('createJournalEntry');
        this._router.navigate(['./', 'new'], { relativeTo: this._activatedRoute });
    }

    create(): void {
        // Create the contact
        this._journalEntryService
            .createEntity()
            .pipe(untilDestroyed(this))
            .subscribe(item => {
                this._updateSelectedItem(item);
            });
    }

    private _updateSelectedItem(item: JournalEntry): void {
        // Go to new tag
        this.selectedItem = item;

        // Fill the form
        this.selectedItemForm.patchValue(item);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    updateSelectedItem(): void {
        // Get the contact object
        const contact = {
            ...this.selectedItemForm.getRawValue(),
        };

        // Update the service on the server
        this._journalEntryService
            .updateEntity(contact.id, contact)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                // this._fuseConfirmationService.open(getSuccessModal());

                setTimeout(() => {
                    this.closeDetails();
                    this._list();
                    // this._serviceService.list().pipe(untilDestroyed(this)).subscribe();
                }, 2000);
            });
    }

    deleteSelectedItem(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: this._translocoService.translate('JournalEntry.DeleteJournalEntry'),
            message: this._translocoService.translate('Questions.AreYouSure'),
            actions: {
                cancel: {
                    label: this._translocoService.translate('General.Cancel'),
                },
                confirm: {
                    label: this._translocoService.translate('General.Delete'),
                },
            },
        });

        // Subscribe to the confirmation dialog closed action
        confirmation
            .afterClosed()
            .pipe(untilDestroyed(this))
            .subscribe(result => {
                // If the confirm button pressed...
                if (result === 'confirmed') {
                    // Get the service object
                    const service = this.selectedItemForm.getRawValue();

                    // Delete the service on the server
                    this._journalEntryService
                        .deleteEntity(service.id)
                        .pipe(untilDestroyed(this))
                        .subscribe(() => {
                            // Close the details
                            this.closeDetails();
                        });
                }
            });
    }

    showFlashMessage(type: 'success' | 'error'): void {
        // Show the message
        this.flashMessage = type;

        // Mark for check
        this._changeDetectorRef.markForCheck();

        // Hide it after 3 seconds
        setTimeout(() => {
            this.flashMessage = null;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        }, 3000);
    }

    toggleDetails(contactId: string): void {
        // If the service is already selected...
        if (this.selectedItem && this.selectedItem.id === contactId) {
            // Close the details
            this.closeDetails();
            return;
        }

        // Get the service by id
        this._journalEntryService
            .getById(contactId)
            .pipe(untilDestroyed(this))
            .subscribe(item => {
                // Set the selected role
                this.selectedItem = item;

                // Fill the form
                this.selectedItemForm.patchValue(item);

                // Mark for check
                this._changeDetectorRef.markForCheck();

                this._changeDetectorRef.detectChanges();
            });
    }

    closeDetails(): void {
        this.selectedItem = null;

        this.selectedItemForm.reset();
    }
}
