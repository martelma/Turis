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
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { trackByFn } from 'app/shared';
import { SearchInputComponent } from 'app/components/ui/search-input/search-input.component';
import { PaginatedListResult } from 'app/shared/services/shared.types';
import { ApplicationScopeGroupService } from '../scope-group.service';
import { ApplicationScopeGroup, ApplicationScopeGroupSearchParameters } from '../scope-group.types';

@UntilDestroy()
@Component({
    selector: 'app-scope-groups-list',
    templateUrl: './scope-groups-list.component.html',
    styles: [
        `
            .list-grid {
                grid-template-columns: auto 1fr 1fr;
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
export class ApplicationScopeGroupListComponent implements OnInit, AfterViewInit {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    flashMessage: 'success' | 'error' | null = null;

    results: PaginatedListResult<ApplicationScopeGroup>;
    list: ApplicationScopeGroup[] = [];
    itemsLoading = false;
    queryParameters: ApplicationScopeGroupSearchParameters;

    activeLang: string;
    selectedItem: ApplicationScopeGroup | null = null;
    selectedItemForm: UntypedFormGroup;

    displayColumns = ['name', 'description'];

    trackByFn = trackByFn;

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
        private _scopeGroupApplicationScopeGroupService: ApplicationScopeGroupService,
        private _translocoService: TranslocoService,
    ) {}

    ngOnInit(): void {
        this.activeLang = this._translocoService.getActiveLang();

        // Create the selected scopeGroupApplicationScopeGroup form
        this.selectedItemForm = this._formBuilder.group({
            id: [''],
            name: ['', [Validators.required]],
            description: [''],
            applicationId: [''],
            application: undefined,
            scopes: [],
        });

        // ApplicationScopeGroups
        this._scopeGroupApplicationScopeGroupService.scopeGroups$
            .pipe(untilDestroyed(this))
            .subscribe((results: PaginatedListResult<ApplicationScopeGroup>) => {
                this.results = results;
                this.list = results?.items;
            });

        // ApplicationScopeGroups loading
        this._scopeGroupApplicationScopeGroupService.scopeGroupsLoading$
            .pipe(untilDestroyed(this))
            .subscribe((scopeGroupApplicationScopeGroupsLoading: boolean) => {
                this.itemsLoading = scopeGroupApplicationScopeGroupsLoading;
            });

        // Query parameters
        this._scopeGroupApplicationScopeGroupService.queryParameters$
            .pipe(untilDestroyed(this))
            .subscribe((queryParameters: ApplicationScopeGroupSearchParameters) => {
                this.queryParameters = queryParameters;
            });

        // Subscribe to scopeGroupApplicationScopeGroup changes
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
        // Create the scopeGroupApplicationScopeGroup
        this._scopeGroupApplicationScopeGroupService
            .createEntity()
            .pipe(untilDestroyed(this))
            .subscribe(item => {
                this._updateSelectedItem(item);
            });
    }

    private _updateSelectedItem(item: ApplicationScopeGroup): void {
        this.selectedItem = item;

        // Fill the form
        this.selectedItemForm.patchValue(item);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    updateSelectedItem(): void {
        // Get the scopeGroupApplicationScopeGroup object
        const scopeGroupApplicationScopeGroup = {
            ...this.selectedItemForm.getRawValue(),
        };

        // Update the scopeGroupApplicationScopeGroup on the server
        this._scopeGroupApplicationScopeGroupService
            .updateEntity(scopeGroupApplicationScopeGroup.id, scopeGroupApplicationScopeGroup)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                // this._fuseConfirmationService.open(getSuccessModal());

                setTimeout(() => {
                    this.closeDetails();
                    this._list();
                    // this._scopeGroupApplicationScopeGroupService.list().pipe(untilDestroyed(this)).subscribe();
                }, 2000);
            });
    }

    deleteSelectedItem(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: this._translocoService.translate('ApplicationScopeGroups.DeleteApplicationScopeGroup'),
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
                    // Get the scopeGroupApplicationScopeGroup object
                    const scopeGroupApplicationScopeGroup = this.selectedItemForm.getRawValue();

                    // Delete the scopeGroupApplicationScopeGroup on the server
                    this._scopeGroupApplicationScopeGroupService
                        .deleteEntity(scopeGroupApplicationScopeGroup.id)
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

    toggleDetails(scopeGroupApplicationScopeGroupId: string): void {
        // If the scopeGroupApplicationScopeGroup is already selected...
        if (this.selectedItem && this.selectedItem.id === scopeGroupApplicationScopeGroupId) {
            // Close the details
            this.closeDetails();
            return;
        }

        // Get the scopeGroupApplicationScopeGroup by id
        this._scopeGroupApplicationScopeGroupService
            .getById(scopeGroupApplicationScopeGroupId)
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
        this._scopeGroupApplicationScopeGroupService
            .listEntities({ ...this.queryParameters })
            .pipe(untilDestroyed(this))
            .subscribe();
    }

    filter(value: string): void {
        this.queryParameters = { pattern: value };
        this._list();
    }
}
