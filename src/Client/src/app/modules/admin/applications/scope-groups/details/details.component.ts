import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { getSuccessModal } from '../../../../../shared/types/confirm-modal.types';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ApplicationScopeGroup, ApplicationScope } from '../../applications.types';
import { ApplicationsService } from '../../applications.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, tap } from 'rxjs';
import { TranslocoModule } from '@ngneat/transloco';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApplicationScopeGroupsListComponent } from '../list/list.component';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FuseCardComponent } from '@fuse/components/card';
import { trackByFn } from 'app/shared';
import { emptyGuid, PaginatedList } from 'app/shared/types/shared.types';
import { MatTabsModule } from '@angular/material/tabs';
import { A11yModule } from '@angular/cdk/a11y';

@UntilDestroy()
@Component({
    standalone: true,
    styleUrls: ['./details.component.scss'],
    selector: 'app-application-scope-groups-details',
    imports: [
        MatButtonModule,
        RouterLink,
        MatIconModule,
        NgIf,
        NgFor,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatTooltipModule,
        MatCheckboxModule,
        MatTabsModule,
        TranslocoModule,
        FuseCardComponent,
        A11yModule,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './details.component.html',
})
export class ApplicationScopeGroupsDetailsComponent implements OnInit {
    public applicationId: string;

    public scopeGroupId: string;

    public scopeGroup: ApplicationScopeGroup;
    public form: FormGroup;

    public isCreate = false;

    public allApplicationScopes: ApplicationScope[] = [];
    public allApplicationScopeGroups: ApplicationScopeGroup[] = [];

    public isCreatingScopeGroup = false;

    public applicationScopes: ApplicationScope[] = [];

    trackByFn = trackByFn;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _applicationScopeGroupsListComponent: ApplicationScopeGroupsListComponent,
        private _applicationsService: ApplicationsService,
        private _router: Router,
    ) {
        const snapshot = this._activatedRoute.snapshot;
        const params = { ...snapshot.queryParams };
        if ('otp' in params) {
            delete params.otp;
            this._router.navigate([], { queryParams: params });
        }

        this._generateFormGroups();
    }

    ngOnInit(): void {
        this._subscribeApplicationScopeGroup();

        this._subscribeApplicationScopes();

        this._loadData();
    }

    private _generateFormGroups(): void {
        this.form = this._formBuilder.group({
            name: ['', Validators.required],
            description: [''],
        });
    }

    private _subscribeApplicationScopeGroup(): void {
        // Get the scopeGroup
        this._applicationsService.applicationScopeGroup$
            .pipe(untilDestroyed(this))
            .subscribe((scopeGroup: ApplicationScopeGroup) => {
                // Get the scopeGroup
                this.scopeGroup = scopeGroup;

                if (scopeGroup != null) {
                    // Fill the form
                    this.form.patchValue({ ...scopeGroup, description: scopeGroup?.description ?? '' });
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    private _subscribeApplicationScopes(): void {
        // Get the scopes
        this._applicationsService.applicationScopes$
            .pipe(untilDestroyed(this))
            .subscribe((list: PaginatedList<ApplicationScope>) => {
                this.allApplicationScopes = list.items;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    private _loadData(): void {
        combineLatest([this._activatedRoute.parent.params, this._activatedRoute.params])
            .pipe(
                tap(([parentParams, params]) => {
                    // Activates the create user mode
                    this.isCreate = params.scopeGroupId === 'new';

                    this.applicationId = parentParams['appId'];
                    this.scopeGroupId = params.scopeGroupId;

                    if (this.isCreate) {
                        this._applicationScopeGroupsListComponent.createScopeGroup();
                    }
                }),
                untilDestroyed(this),
            )
            .subscribe();
    }

    updateOrCreateScopeGroup(): void {
        this.scopeGroup = { ...this.scopeGroup, ...this.form.value };

        if (this.isCreate) {
            this.scopeGroup.id = emptyGuid;
        }

        this._applicationsService
            .saveApplicationScopeGroup(this.applicationId, this.scopeGroup, this.isCreate)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                this._fuseConfirmationService.open(getSuccessModal());

                if (this.isCreate) {
                    this.closeCreateScopeGroupDrawer();
                }
            });
    }

    deleteScopeGroup(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete ScopeGroup',
            message: 'Are you sure you want to remove this scopeGroup? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete',
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
                    // Delete the application on the server
                    this._applicationsService
                        .deleteApplicationScopeGroup(this.applicationId, this.scopeGroup.id)
                        .subscribe(() => {
                            this._fuseConfirmationService.open(getSuccessModal());

                            // Close the details
                            this.closeDetails();
                        });
                }
            });
    }

    closeDetails(): void {
        this.scopeGroup = null;
        this._applicationScopeGroupsListComponent?.closeDetails();
    }

    isScopeChecked(scopeId: string): boolean {
        return !!this.scopeGroup.scopes.find(s => s.id === scopeId);
    }

    isScopeGroupChecked(scopeGroupId: string): boolean {
        return this.scopeGroup.scopes.some(
            () => this.allApplicationScopes.find(scope => scope.id === scope.id)?.scopeGroupId === scopeGroupId,
        );
    }

    toggleScope(scopeId: string): void {
        if (this.isScopeChecked(scopeId)) {
            this.scopeGroup.scopes = this.scopeGroup.scopes.filter(scope => scope.id !== scopeId);
        } else {
            this.scopeGroup.scopes.push(this.allApplicationScopes.find(s => s.id === scopeId));
        }
    }

    toggleScopeGroup(scopeGroupId: string): void {
        if (this.isScopeGroupChecked(scopeGroupId)) {
            this.scopeGroup.scopes = this.scopeGroup.scopes.filter(
                scope => this.allApplicationScopes.find(s => s.id === scope.id).scopeGroupId !== scopeGroupId,
            );
        } else {
            this.allApplicationScopes.forEach(scope => {
                if (scope.scopeGroupId === scopeGroupId && !this.scopeGroup.scopes.find(s => s.id === scope.id)) {
                    this.scopeGroup.scopes.push(scope);
                }
            });
        }
    }

    closeCreateScopeGroupDrawer(): Promise<MatDrawerToggleResult> {
        // Navigate to the scopeGroup list component
        this._router.navigate(['../'], { relativeTo: this._activatedRoute });

        // Close the matDrawer
        return this._applicationScopeGroupsListComponent?.matDrawer?.close();
    }

    createScope(): void {
        this._applicationScopeGroupsListComponent?.createScope();
    }

    deleteScope(scope: ApplicationScope): void {
        this._applicationScopeGroupsListComponent?.deleteScope(scope);
    }

    openScopesEditModal(scope?: ApplicationScope): void {
        this._applicationScopeGroupsListComponent?.openScopesEditModal(scope);
    }
}
