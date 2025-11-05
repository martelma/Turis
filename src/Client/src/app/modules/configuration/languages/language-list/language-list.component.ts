import { CurrencyPipe, JsonPipe, NgClass, NgFor, NgIf, NgStyle, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
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
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { trackByFn } from 'app/shared';
import { Language, LanguageSearchParameters } from '../language.types';
import { LanguageService } from '../language.service';
import { PaginatedListResult } from 'app/shared/services/shared.types';
import { SearchInputComponent } from 'app/components/ui/search-input/search-input.component';

@UntilDestroy()
@Component({
    selector: 'app-language-list',
    templateUrl: './language-list.component.html',
    styles: [
        `
            .list-grid {
                grid-template-columns: 1fr 1fr 3fr 1fr;
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
        TranslocoModule,
        SearchInputComponent,
        JsonPipe,
        SearchInputComponent,
    ],
})
export class LanguageListComponent implements OnInit, AfterViewInit {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    flashMessage: 'success' | 'error' | null = null;

    results: PaginatedListResult<Language>;
    list: Language[] = [];
    itemsLoading = false;
    queryParameters: LanguageSearchParameters;

    activeLang: string;
    selectedItem: Language | null = null;
    selectedItemForm: UntypedFormGroup;

    languagesColumns = ['code', 'name', 'codeIso'];

    trackByFn = trackByFn;

    constructor(
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
        private _languageService: LanguageService,
        private _translocoService: TranslocoService,
        private _changeDetectorRef: ChangeDetectorRef,
    ) {}

    ngOnInit(): void {
        this.activeLang = this._translocoService.getActiveLang();

        // Create the selected language form
        this.selectedItemForm = this._formBuilder.group({
            id: [''],
            code: ['', [Validators.required]],
            name: ['', [Validators.required]],
            codeIso: ['', [Validators.required]],
        });

        // Languages
        this._languageService.languages$
            .pipe(untilDestroyed(this))
            .subscribe((results: PaginatedListResult<Language>) => {
                this.results = results;
                this.list = results?.items;
            });

        // Languages loading
        this._languageService.languagesLoading$.pipe(untilDestroyed(this)).subscribe((languagesLoading: boolean) => {
            this.itemsLoading = languagesLoading;
        });

        // Query parameters
        this._languageService.queryParameters$
            .pipe(untilDestroyed(this))
            .subscribe((queryParameters: LanguageSearchParameters) => {
                this.queryParameters = queryParameters;
            });

        // Subscribe to language changes
        this._translocoService.langChanges$.pipe(untilDestroyed(this)).subscribe(activeLang => {
            // Get the active lang
            this.activeLang = activeLang;
        });
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
                this.closeDetails();
            });
        }
        this._list();
    }

    create(): void {
        // Create the language
        this._languageService
            .createEntity()
            .pipe(untilDestroyed(this))
            .subscribe(item => {
                this._updateSelectedItem(item);
            });
    }

    private _updateSelectedItem(item: Language): void {
        // Go to new tag
        this.selectedItem = item;

        // Fill the form
        this.selectedItemForm.patchValue(item);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    updateSelectedItem(): void {
        // Get the language object
        const language = {
            ...this.selectedItemForm.getRawValue(),
        };

        // Update the language on the server
        this._languageService
            .updateEntity(language.id, language)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                // this._fuseConfirmationService.open(getSuccessModal());

                setTimeout(() => {
                    this.closeDetails();
                    this._list();
                    // this._languageService.list().pipe(untilDestroyed(this)).subscribe();
                }, 2000);
            });
    }

    deleteSelectedItem(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: this._translocoService.translate('Languages.DeleteLanguage'),
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
                    // Get the language object
                    const language = this.selectedItemForm.getRawValue();

                    // Delete the language on the server
                    this._languageService
                        .deleteEntity(language.id)
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

    toggleDetails(languageId: string): void {
        // If the language is already selected...
        if (this.selectedItem && this.selectedItem.id === languageId) {
            // Close the details
            this.closeDetails();
            return;
        }

        // Get the language by id
        this._languageService
            .getById(languageId)
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

    handlePageEvent(event: PageEvent): void {
        this.queryParameters = { ...this.queryParameters, pageIndex: event.pageIndex, pageSize: event.pageSize };

        this._list();
    }

    private _list(): void {
        this._languageService
            .listEntities({ ...this.queryParameters })
            .pipe(untilDestroyed(this))
            .subscribe();
    }

    filter(value: string): void {
        this.queryParameters = { pattern: value };
        this._list();
    }
}
