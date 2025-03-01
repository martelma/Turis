import { A11yModule } from '@angular/cdk/a11y';
import { NgFor, NgIf } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@ngneat/transloco';
import { UntilDestroy } from '@ngneat/until-destroy';
import { trackByFn } from 'app/shared';
import { emptyGuid } from 'app/shared/types/shared.types';

@UntilDestroy()
@Component({
    selector: 'app-application-scopes-form',
    templateUrl: './form.component.html',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatTooltipModule,
        MatInputModule,
        MatSelectModule,
        TranslocoModule,
        A11yModule,
    ],
})
export class ApplicationScopesFormComponent implements OnChanges {
    @Input() scope: ApplicationScope;
    @Input() scopeGroups: ApplicationScopeGroup[];

    public form: FormGroup;

    trackByFn = trackByFn;
    emptyGuid = emptyGuid;

    get value(): any {
        return this.form.value;
    }

    getRawValue(): any {
        return this.form.getRawValue();
    }

    get valid(): boolean {
        return this.form.valid;
    }

    constructor(private _formBuilder: FormBuilder) {
        this._generateFormGroups();
    }

    ngOnChanges(): void {
        if (this.scope != null) {
            // Fill the form
            this.form.patchValue({
                ...this.scope,
                id: this.scope?.id ?? emptyGuid,
                description: this.scope?.description ?? '',
                applicationId: this.scope?.applicationId ?? emptyGuid,
                scopeGroupId: this.scope?.scopeGroup?.id ?? emptyGuid,
            });
        }
    }

    private _generateFormGroups(): void {
        this.form = this._formBuilder.group({
            id: [''],
            name: ['', Validators.required],
            description: [''],
            applicationId: [''],
            scopeGroupId: [this.scope ? this.scope.scopeGroup?.id : emptyGuid],
        });
    }
}
