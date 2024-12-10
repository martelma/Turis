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
import { RolesService } from '../../../../shared/modules/roles/roles.service';
import { PaginatedListResult } from '../../../../shared/shared.types';
import { Role, RoleSearchParameters } from 'app/shared/modules/roles/roles.types';
import { TranslationsComponent } from 'app/shared/modules/translations/translations.component';
import { parseTranslations } from 'app/shared/modules/translations/translations.types';
import { SearchInputComponent } from 'app/shared/components/ui/search-input/search-input.component';
import { getTranslation } from '../../../../shared/modules/translations/translations.types';
import { M3User } from 'app/core/user/user.types';
import { Scopes } from 'app/shared/modules/roles/roles.scopes';
import { userHasScope } from 'app/layout/common/user/user.utils';
import { UserService } from 'app/core/user/user.service';

@UntilDestroy()
@Component({
    selector: 'app-role-list',
    templateUrl: './role-list.component.html',
    styles: [
        /* language=SCSS */
        `
            .role-grid {
                grid-template-columns: 1fr 1fr 2fr 50px;
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
        TranslationsComponent,
        SearchInputComponent,
    ],
})
export class RoleListComponent implements OnInit, AfterViewInit {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    flashMessage: 'success' | 'error' | null = null;

    results: PaginatedListResult<Role>;
    roles: Role[] = [];
    itemsLoading = false;
    queryParameters: RoleSearchParameters;

    activeLang: string;
    selectedItem: Role | null = null;
    selectedItemForm: UntypedFormGroup;

    rolesColumns = ['code', 'name', 'description', 'details'];

    trackByFn = trackByFn;
    getTranslation = getTranslation;

    // User
    user: M3User;
    userCanDeleteRoles = false;
    userCanUpdateRoles = false;

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
        private _rolesService: RolesService,
        private _translocoService: TranslocoService,
        private _userService: UserService,
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
        this._rolesService.roles$.pipe(untilDestroyed(this)).subscribe((results: PaginatedListResult<Role>) => {
            this.results = results;

            this.roles = results?.items;
        });

        // Roles loading
        this._rolesService.rolesLoading$.pipe(untilDestroyed(this)).subscribe((rolesLoading: boolean) => {
            this.itemsLoading = rolesLoading;
        });

        // Query parameters
        this._rolesService.queryParameters$
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

    private _subscribeUser(): void {
        this._userService.user$.pipe(untilDestroyed(this)).subscribe((user: M3User) => {
            this.user = user;

            this.userCanDeleteRoles = userHasScope(user, Scopes.ROLES_DELETE);
            this.userCanUpdateRoles = userHasScope(user, Scopes.ROLES_UPDATE);
        });
    }

    refreshRoles(): void {
        // TODO: To get the list of available roles from M3 and parse them into valid M3-Console objects
    }

    updateSelectedRole(): void {
        // Get the role object
        const role = {
            ...this.selectedItemForm.getRawValue(),
            descriptions: parseTranslations(this.selectedItemForm.get('descriptions')?.value),
        };

        // Remove the currentImageIndex field
        delete role.currentImageIndex;

        // Update the role on the server
        this._rolesService
            .updateRole(role.id, role)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                // Show a success message
                this.showFlashMessage('success');

                // Refreshes the list
                this._getRoles();
            });
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
                    this._rolesService
                        .deleteRole(role.id)
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
        this._rolesService
            .getRoleById(roleId)
            .pipe(untilDestroyed(this))
            .subscribe(role => {
                // Set the selected role
                this.selectedItem = role;

                // Fill the form
                this.selectedItemForm.patchValue(role);

                // Mark for check
                this._changeDetectorRef.markForCheck();

                this.selectedItemForm.get('descriptions')?.patchValue({
                    en: this.selectedItem.descriptions?.find(x => x.languageCode.toLowerCase() === 'en')?.content ?? '',
                    es: this.selectedItem.descriptions?.find(x => x.languageCode.toLowerCase() === 'es')?.content ?? '',
                    fr: this.selectedItem.descriptions?.find(x => x.languageCode.toLowerCase() === 'fr')?.content ?? '',
                    it: this.selectedItem.descriptions?.find(x => x.languageCode.toLowerCase() === 'it')?.content ?? '',
                });

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
        this._rolesService
            .getRoles({ ...this.queryParameters })
            .pipe(untilDestroyed(this))
            .subscribe();
    }

    filter(value: string): void {
        this.queryParameters = { pattern: value };

        this._getRoles();
    }
}
