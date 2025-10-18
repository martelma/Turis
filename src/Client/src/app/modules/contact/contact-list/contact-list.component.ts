import {
    CurrencyPipe,
    DatePipe,
    JsonPipe,
    LowerCasePipe,
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
import {
    FormControl,
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
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
import { SearchInputComponent } from 'app/components/ui/search-input/search-input.component';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { Contact, ContactSearchParameters } from '../contact.types';
import { ContactService } from '../contact.service';
import { ContactComponent } from '../contact.component';
import { BookmarkService } from 'app/modules/bookmark/bookmark.service';
import { TagSummaryComponent } from 'app/shared/components/tag-summary/tag-summary.component';
import { AppSettings } from 'app/constants';
import { UserSettingsService } from 'app/shared/services/user-setting.service';
import { debounceTime, Observable, switchMap } from 'rxjs';

@UntilDestroy()
@Component({
    selector: 'app-contact-list',
    templateUrl: './contact-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        NgStyle,
        NgTemplateOutlet,
        CurrencyPipe,
        DatePipe,
        LowerCasePipe,
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
        MatPaginatorModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatOptionModule,
        MatCheckboxModule,
        MatRippleModule,
        TranslocoModule,
        SearchInputComponent,
        SearchInputComponent,
        TagSummaryComponent,
    ],
})
export class ContactListComponent implements OnInit, AfterViewInit {
    @Input() debounce = 500;
    @ViewChild('contactList') contactList: ElementRef;

    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    flashMessage: 'success' | 'error' | null = null;

    results: PaginatedListResult<Contact>;
    list: Contact[] = [];
    itemsLoading = false;
    searchControl = new FormControl('');
    contactParameters: ContactSearchParameters;

    activeLang: string;
    selectedItem: Contact;
    selectedItemForm: UntypedFormGroup;

    trackByFn = trackByFn;

    viewList = true;

    constructor(
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
        private _contactService: ContactService,
        private _bookmarkService: BookmarkService,
        private _translocoService: TranslocoService,
        private _userSettingsService: UserSettingsService,

        public contactComponent: ContactComponent,
    ) {
        this._contactService.viewList$.subscribe(value => {
            this.viewList = value;
        });
    }

    ngOnInit(): void {
        this.activeLang = this._translocoService.getActiveLang();

        // Create the selected service form
        this.selectedItemForm = this._formBuilder.group({
            id: [''],
            code: ['', [Validators.required]],
            name: ['', [Validators.required]],
        });

        // Services
        this._contactService.contacts$.pipe(untilDestroyed(this)).subscribe((results: PaginatedListResult<Contact>) => {
            this.results = results;
            this.list = results?.items;
            // console.log('results', results);
            // console.log('list', this.list);
        });

        // contact loading
        this._contactService.contactsLoading$.pipe(untilDestroyed(this)).subscribe((contactsLoading: boolean) => {
            this.itemsLoading = contactsLoading;
        });

        // Service parameters
        this._contactService.contactParameters$
            .pipe(untilDestroyed(this))
            .subscribe((contactParameters: ContactSearchParameters) => {
                this.contactParameters = contactParameters;
            });

        // Subscribe to contact changes
        this._translocoService.langChanges$.pipe(untilDestroyed(this)).subscribe(activeLang => {
            // Get the active lang
            this.activeLang = activeLang;
        });

        this._subscribeSearchControlChanges();

        this._subscribeContactParameters();
    }

    async ngAfterViewInit(): Promise<void> {
        this.viewList = await this._userSettingsService.getBooleanValue(`${AppSettings.Contact}:viewList`);

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
                this.closeDetails();
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

    private _subscribeContactParameters(): void {
        this._contactService.contactParameters$
            .pipe(untilDestroyed(this))
            .subscribe((contactParameters: ContactSearchParameters) => {
                this.contactParameters = contactParameters;
            });
    }

    toggleBookmarks(): void {
        this._search({
            onlyBookmarks: !this.contactParameters.onlyBookmarks,
            pageIndex: 0,
            pageSize: this._paginator.pageSize,
        }).subscribe();
    }

    private _search(contactParameters: ContactSearchParameters): Observable<PaginatedListResult<Contact>> {
        return this._contactService
            .listEntities({ ...this.contactParameters, ...contactParameters })
            .pipe(untilDestroyed(this));
    }

    handleBookmark(contact: Contact): void {
        if (contact.bookmarkId) {
            this._bookmarkService
                .delete(contact.bookmarkId)
                .pipe(untilDestroyed(this))
                .subscribe(() => {
                    // Refresh the selected contact
                    this._contactService.getById(contact.id).pipe(untilDestroyed(this)).subscribe();

                    // Refresh the list
                    this._search({}).subscribe();
                });
        } else {
            this._bookmarkService
                .create({
                    entityName: 'Contact',
                    entityId: contact.id,
                })
                .pipe(untilDestroyed(this))
                .subscribe(() => {
                    // Refresh the selected contact
                    this._contactService.getById(contact.id).pipe(untilDestroyed(this)).subscribe();

                    // Refresh the list
                    this._search({}).subscribe();
                });
        }
    }

    navigateToItem(item: Contact): void {
        item.selected = true;
        this._router.navigate(item.id ? ['.', item.id] : ['.', 'new'], { relativeTo: this._activatedRoute });
    }

    onItemSelected(contact: Contact): void {
        this.selectedItem = contact;

        this.list.forEach(item => {
            item.selected = false;
        });

        this.selectedItem.selected = true;
    }

    handlePageEvent(event: PageEvent): void {
        this.contactParameters = {
            ...this.contactParameters,
            pageIndex: event.pageIndex,
            pageSize: event.pageSize,
        };

        this._list();
    }

    private _list(): void {
        this._contactService
            .listEntities({ ...this.contactParameters })
            .pipe(untilDestroyed(this))
            .subscribe(items => {
                // if (items?.items?.length > 0) {
                //     this.navigateToItem(items.items[0]);
                // }
            });
    }

    filter(value: string): void {
        this.contactParameters = { pattern: value };
        // this._list();
        this._search(this.contactParameters);
    }

    createContact(): void {
        this._router.navigate(['./', 'new'], { relativeTo: this._activatedRoute });
    }

    create(): void {
        // Create the contact
        this._contactService
            .createEntity()
            .pipe(untilDestroyed(this))
            .subscribe(item => {
                this._updateSelectedItem(item);
            });
    }

    private _updateSelectedItem(item: Contact): void {
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
        this._contactService
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
            title: this._translocoService.translate('Services.DeleteService'),
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
                    this._contactService
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
        this._contactService
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
