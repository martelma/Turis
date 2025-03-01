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
import { SearchInputComponent } from 'app/shared/components/ui/search-input/search-input.component';
import { PaginatedListResult } from 'app/shared/services/shared.types';
import { ApplicationRole, RoleSearchParameters } from '../role.types';
import { RoleService } from '../role.service';

@UntilDestroy()
@Component({
    selector: 'app-role-list',
    templateUrl: './role-list.component.html',
    styles: [
        /* language=SCSS */
        `
            .role-grid {
                grid-template-columns: auto auto auto 1fr;
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
        JsonPipe,
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
    ],
})
export class RoleListComponent implements OnInit, AfterViewInit {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    flashMessage: 'success' | 'error' | null = null;

    results: PaginatedListResult<ApplicationRole>;
    roles: ApplicationRole[] = [];
    itemsLoading = false;
    queryParameters: RoleSearchParameters;

    activeLang: string;
    selectedItem: ApplicationRole | null = null;
    selectedItemForm: UntypedFormGroup;

    rolesColumns = ['code', 'name', 'description', 'details'];

    trackByFn = trackByFn;

    // User
    userCanDeleteRoles = false;
    userCanUpdateRoles = false;

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
        private _roleService: RoleService,
        private _translocoService: TranslocoService,
    ) {}

    ngOnInit(): void {
        this.activeLang = this._translocoService.getActiveLang();

        // Create the selected role form
        this.selectedItemForm = this._formBuilder.group({
            id: [''],
            code: ['', [Validators.required]],
            name: ['', [Validators.required]],
        });

        this._subscribeUser();

        // Roles
        this._roleService.roles$
            .pipe(untilDestroyed(this))
            .subscribe((results: PaginatedListResult<ApplicationRole>) => {
                this.results = results;

                this.roles = results?.items;
            });

        // Roles loading
        this._roleService.rolesLoading$.pipe(untilDestroyed(this)).subscribe((rolesLoading: boolean) => {
            this.itemsLoading = rolesLoading;
        });

        // Query parameters
        this._roleService.queryParameters$
            .pipe(untilDestroyed(this))
            .subscribe((queryParameters: RoleSearchParameters) => {
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
    }

    private _subscribeUser(): void {}

    refreshRoles(): void {
        // TODO: To get the list of available roles from M3 and parse them into valid M3-Console objects
    }

    deleteSelectedRole(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: this._translocoService.translate('Roles.DeleteRole'),
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
                    // Get the role object
                    const role = this.selectedItemForm.getRawValue();

                    // Delete the role on the server
                    this._roleService
                        .deleteEntity(role.id)
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

    toggleDetails(roleId: string): void {
        // If the role is already selected...
        if (this.selectedItem && this.selectedItem.id === roleId) {
            // Close the details
            this.closeDetails();
            return;
        }

        // Get the role by id
        this._roleService
            .getById(roleId)
            .pipe(untilDestroyed(this))
            .subscribe(role => {
                // Set the selected role
                this.selectedItem = role;

                // Fill the form
                this.selectedItemForm.patchValue(role);

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

        this._getRoles();
    }

    private _getRoles(): void {
        this._roleService
            .listEntities({ ...this.queryParameters })
            .pipe(untilDestroyed(this))
            .subscribe();
    }

    filter(value: string): void {
        this.queryParameters = { pattern: value };

        this._getRoles();
    }
}
