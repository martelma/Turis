import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { JsonPipe, NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { getSuccessModal } from '../../../../../shared/types/confirm-modal.types';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ApplicationScope, ApplicationScopeGroup } from '../../applications.types';
import { ApplicationsService } from '../../applications.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, tap } from 'rxjs';
import { TranslocoModule } from '@ngneat/transloco';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApplicationScopesListComponent } from '../list/list.component';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FuseCardComponent } from '@fuse/components/card';
import { trackByFn } from 'app/shared';
import { emptyGuid, PaginatedList } from 'app/shared/types/shared.types';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { A11yModule } from '@angular/cdk/a11y';

@UntilDestroy()
@Component({
    standalone: true,
    styleUrls: ['./details.component.scss'],
    selector: 'app-application-scopes-details',
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
        MatInputModule,
        MatSelectModule,
        TranslocoModule,
        FuseCardComponent,
        JsonPipe,
        A11yModule,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './details.component.html',
})
export class ApplicationScopesDetailsComponent implements OnInit {
    public applicationId: string;

    public scopeId: string;

    public scope: ApplicationScope;
    public form: FormGroup;

    public isCreate = false;

    public allApplicationScopeGroups: ApplicationScopeGroup[] = [];

    public isCreatingScope = false;

    public applicationScopes: ApplicationScope[] = [];

    trackByFn = trackByFn;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _applicationScopesListComponent: ApplicationScopesListComponent,
        private _applicationsService: ApplicationsService,
        private _router: Router,
    ) {
        const snapshot = this._activatedRoute.snapshot;
        const params = { ...snapshot.queryParams };
        if ('otp' in params) {
            delete params.otp;
            this._router.navigate([], { queryParams: params });
        }
    }

    ngOnInit(): void {
        this._generateFormGroups();

        this._subscribeApplicationScope();

        this._subscribeApplicationScopes();

        this._subscribeApplicationScopeGroups();

        this._loadData();
    }

    private _generateFormGroups(): void {
        this.form = this._formBuilder.group({
            name: ['', Validators.required],
            description: [''],
            scopeGroupId: [this.scope ? this.scope.scopeGroupId : ''],
        });
    }

    private _subscribeApplicationScope(): void {
        // Get the scope
        this._applicationsService.applicationScope$.pipe(untilDestroyed(this)).subscribe((scope: ApplicationScope) => {
            // Get the scope
            this.scope = scope;

            if (scope != null) {
                // Fill the form
                this.form.patchValue({
                    ...scope,
                    description: scope?.description ?? '',
                    scopeGroupId: scope?.scopeGroupId ?? '',
                });
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
                this.applicationScopes = list.items;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    private _subscribeApplicationScopeGroups(): void {
        // Get the scope groups
        this._applicationsService.applicationScopeGroups$
            .pipe(untilDestroyed(this))
            .subscribe((list: PaginatedList<ApplicationScopeGroup>) => {
                this.allApplicationScopeGroups = list.items;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    private _loadData(): void {
        combineLatest([this._activatedRoute.parent.params, this._activatedRoute.params])
            .pipe(
                tap(([parentParams, params]) => {
                    // Activates the create user mode
                    this.isCreate = params.scopeId === 'new';

                    this.applicationId = parentParams['appId'];
                    this.scopeId = params.scopeId;

                    if (this.isCreate) {
                        this._applicationScopesListComponent.createScope();
                    }

                    this._getApplicationScope();

                    this._getApplicationScopes();

                    this._getApplicationScopeGroups();
                }),
                untilDestroyed(this),
            )
            .subscribe();
    }

    private _getApplicationScope(): void {
        this._applicationsService
            .getApplicationScopeById(this.applicationId, this.scopeId)
            .pipe(untilDestroyed(this))
            .subscribe();
    }

    private _getApplicationScopes(): void {
        this._applicationsService.getApplicationScopes(this.applicationId).pipe(untilDestroyed(this)).subscribe();
    }

    private _getApplicationScopeGroups(): void {
        this._applicationsService.getApplicationScopeGroups(this.applicationId).pipe(untilDestroyed(this)).subscribe();
    }

    updateOrCreateScope(): void {
        this.scope = { ...this.scope, ...this.form.value };
        if (this.isCreate) {
            this.scope.id = emptyGuid;
        }

        this._applicationsService
            .saveApplicationScope(this.applicationId, this.scope, this.isCreate)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                this._fuseConfirmationService.open(getSuccessModal());

                if (this.isCreate) {
                    this.closeCreateScopeDrawer();
                }
            });
    }

    closeDetails(): void {
        this.scope = null;
        this._applicationScopesListComponent?.closeDetails();
    }

    closeCreateScopeDrawer(): Promise<MatDrawerToggleResult> {
        // Navigate to the scope list component
        this._router.navigate(['../'], { relativeTo: this._activatedRoute });

        // Close the matDrawer
        return this._applicationScopesListComponent?.matDrawer?.close();
    }

    createScope(): void {
        this._applicationScopesListComponent?.createScope();
    }

    deleteScope(): void {
        this._applicationScopesListComponent?.deleteScope(this.scope);
    }
}
