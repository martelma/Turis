import { CurrencyPipe, JsonPipe, KeyValuePipe, NgClass, NgFor, NgIf, NgStyle, NgTemplateOutlet } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    OnInit,
    QueryList,
    ViewChild,
    ViewChildren,
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
import { MatExpansionModule, MatExpansionPanel } from '@angular/material/expansion';
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
import { PaginatedList } from 'app/shared/types/shared.types';
import { groupBy, mapValues, omit } from 'lodash';
import { ApplicationScopeGroupService } from '../../scope-groups/scope-group.service';
import { ApplicationScopeGroup } from '../../scope-groups/scope-group.types';
import { ApplicationScopeService } from '../../scopes/scope.service';
import { ApplicationScope } from '../../scopes/scope.types';
import { ApplicationRoleService } from '../role.service';
import { ApplicationRole, ApplicationRoleSearchParameters } from '../role.types';

@UntilDestroy()
@Component({
    selector: 'app-role-list',
    templateUrl: './role-list.component.html',
    styles: [
        /* language=SCSS */
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
        JsonPipe,
        CurrencyPipe,
        KeyValuePipe,
        FormsModule,
        ReactiveFormsModule,
        MatProgressBarModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatSortModule,
        NgTemplateOutlet,
        MatExpansionModule,
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

    @ViewChildren('card') cards: QueryList<MatExpansionPanel>;

    public collapsed = false;

    flashMessage: 'success' | 'error' | null = null;

    results: PaginatedListResult<ApplicationRole>;
    list: ApplicationRole[] = [];
    itemsLoading = false;
    queryParameters: ApplicationRoleSearchParameters;

    activeLang: string;
    selectedItem: ApplicationRole | null = null;
    selectedItemForm: UntypedFormGroup;

    displayColumns = ['name', 'description'];

    allApplicationScopes: ApplicationScope[] = [];

    public groupedApplicationScopes: {
        [x: string]: Pick<
            ApplicationScope,
            'name' | 'description' | 'applicationId' | 'id' | 'roleIds' | 'scopeGroupId'
        >[];
    };

    public allApplicationScopeGroups: ApplicationScopeGroup[] = [];

    public isCreatingScopeGroup = false;

    public applicationScopes: ApplicationScope[] = [];

    filterScopesInputControl = new FormControl('');

    trackByFn = trackByFn;

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
        private _applicationRoleService: ApplicationRoleService,
        private _applicationScopeGroupService: ApplicationScopeGroupService,
        private _applicationScopeService: ApplicationScopeService,
        private _translocoService: TranslocoService,
    ) {}

    ngOnInit(): void {
        this.activeLang = this._translocoService.getActiveLang();

        // Create the selected scopeGroupApplicationRole form
        this.selectedItemForm = this._formBuilder.group({
            id: [''],
            name: ['', [Validators.required]],
            description: [''],
            applicationId: [''],
            application: undefined,
            scopes: [],
        });

        // ApplicationRoles
        this._applicationRoleService.roles$
            .pipe(untilDestroyed(this))
            .subscribe((results: PaginatedListResult<ApplicationRole>) => {
                this.results = results;
                this.list = results?.items;
            });

        // ApplicationRoles loading
        this._applicationRoleService.rolesLoading$
            .pipe(untilDestroyed(this))
            .subscribe((scopeGroupApplicationRolesLoading: boolean) => {
                this.itemsLoading = scopeGroupApplicationRolesLoading;
            });

        // Query parameters
        this._applicationRoleService.queryParameters$
            .pipe(untilDestroyed(this))
            .subscribe((queryParameters: ApplicationRoleSearchParameters) => {
                this.queryParameters = queryParameters;
            });

        // Get the scope groups
        this._applicationScopeGroupService.scopeGroups$
            .pipe(untilDestroyed(this))
            .subscribe((list: PaginatedList<ApplicationScopeGroup>) => {
                this.allApplicationScopeGroups = list.items;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the scopes
        this._applicationScopeService.scopes$
            .pipe(untilDestroyed(this))
            .subscribe((list: PaginatedList<ApplicationScope>) => {
                this.allApplicationScopes = list.items;

                this.groupedApplicationScopes = mapValues(groupBy(list.items, 'scopeGroupName'), applicationList =>
                    applicationList.map(a => omit(a, 'scopeGroupName')),
                );

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to scopeGroupApplicationRole changes
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
        this._listScopes();
    }

    private _listScopes(): void {
        this._applicationScopeService.listEntities().pipe(untilDestroyed(this)).subscribe();
    }

    create(): void {
        // Create the scopeGroupApplicationRole
        this._applicationRoleService
            .createEntity()
            .pipe(untilDestroyed(this))
            .subscribe(item => {
                this._updateSelectedItem(item);
            });
    }

    private _updateSelectedItem(item: ApplicationRole): void {
        this.selectedItem = item;

        // Fill the form
        this.selectedItemForm.patchValue(item);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    updateSelectedItem(): void {
        // Get the scopeGroupApplicationRole object
        const scopeGroupApplicationRole = {
            ...this.selectedItemForm.getRawValue(),
        };

        // Update the scopeGroupApplicationRole on the server
        this._applicationRoleService
            .updateEntity(scopeGroupApplicationRole.id, scopeGroupApplicationRole)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                // this._fuseConfirmationService.open(getSuccessModal());

                setTimeout(() => {
                    this.closeDetails();
                    this._list();
                    // this._scopeGroupApplicationRoleService.list().pipe(untilDestroyed(this)).subscribe();
                }, 2000);
            });
    }

    deleteSelectedItem(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: this._translocoService.translate('ApplicationRoles.DeleteApplicationRole'),
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
                    // Get the scopeGroupApplicationRole object
                    const scopeGroupApplicationRole = this.selectedItemForm.getRawValue();

                    // Delete the scopeGroupApplicationRole on the server
                    this._applicationRoleService
                        .deleteEntity(scopeGroupApplicationRole.id)
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

    toggleDetails(id: string): void {
        // If the scopeGroupApplicationRole is already selected...
        if (this.selectedItem && this.selectedItem.id === id) {
            // Close the details
            this.closeDetails();
            return;
        }

        // Get the scopeGroupApplicationRole by id
        this._applicationRoleService
            .getById(id)
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
        this._applicationRoleService
            .listEntities({ ...this.queryParameters })
            .pipe(untilDestroyed(this))
            .subscribe();
    }

    filter(value: string): void {
        this.queryParameters = { pattern: value };
        this._list();
    }

    private _filterScopes(value: string): void {
        const scopes = this.allApplicationScopes.filter(x => x.name.toLowerCase().includes(value.toLowerCase()));

        this.groupedApplicationScopes = mapValues(groupBy(scopes, 'scopeGroup.name'), applicationList =>
            applicationList.map(a => omit(a, 'scopeGroup.name')),
        );

        this._changeDetectorRef.detectChanges();
    }

    unselectAllInScopeGroup(scopeGroupName: string): void {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const found = Object.entries(this.groupedApplicationScopes).find(([key, _]) => key === scopeGroupName);
        if (found) {
            found[1].forEach(scope => {
                this.selectedItem.scopes = this.selectedItem?.scopes?.filter(s => s.id !== scope.id);
            });
        }
    }

    selectAllInScopeGroup(scopeGroupName: string): void {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const found = Object.entries(this.groupedApplicationScopes).find(([key, _]) => key === scopeGroupName);
        if (found) {
            found[1].forEach(scope => {
                if (this.selectedItem?.scopes?.find(s => s.id === scope.id) == null) {
                    this.selectedItem?.scopes?.push(scope);
                }
            });
        }
    }

    expandAll(): void {
        this.collapsed = false;

        this.cards.forEach(c => {
            c.open();
        });
    }

    collapseAll(): void {
        this.collapsed = true;

        this.cards.forEach(c => {
            c.close();
        });
    }

    isScopeChecked(scopeId: string): boolean {
        return (
            this.selectedItem?.scopes?.find(s => {
                return s?.id === scopeId;
            }) != null
        );
    }

    isScopeGroupChecked(scopeGroupId: string): boolean {
        return this.selectedItem?.scopes?.some(
            () => this.allApplicationScopes?.find(scope => scope.id === scope.id)?.scopeGroupId === scopeGroupId,
        );
    }

    toggleScope(scopeId: string): void {
        if (this.isScopeChecked(scopeId)) {
            this.selectedItem.scopes = this.selectedItem?.scopes?.filter(scope => scope.id !== scopeId);
        } else {
            const scope = this.allApplicationScopes?.find(s => s.id === scopeId);
            if (scope) {
                this.selectedItem?.scopes?.push(scope);
            }
        }
    }

    toggleScopeGroup(scopeGroupId: string): void {
        if (this.isScopeGroupChecked(scopeGroupId)) {
            this.selectedItem.scopes = this.selectedItem?.scopes?.filter(
                scope => this.allApplicationScopes?.find(s => s.id === scope.id)?.scopeGroupId !== scopeGroupId,
            );
        } else {
            this.allApplicationScopes?.forEach(scope => {
                if (scope.scopeGroupId === scopeGroupId && !this.selectedItem?.scopes?.find(s => s.id === scope.id)) {
                    this.selectedItem?.scopes?.push(scope);
                }
            });
        }
    }
}
