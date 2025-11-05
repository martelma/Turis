import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { CdModalComponent } from 'app/shared/components/cd-modal/cd-modal.component';
import { ApplicationScope, ApplicationScopeGroup } from 'app/modules/admin/applications/applications.types';
import { trackByFn } from '../../../../../shared/utils';
import { Guid } from 'guid-typescript';
import { A11yModule } from '@angular/cdk/a11y';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
    selector: 'user-application-scope-modal',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        MatGridListModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatInputModule,
        MatMenuModule,
        MatSelectModule,
        CdModalComponent,
        TranslocoModule,
        A11yModule,
    ],
    templateUrl: './scope-modal.component.html',
})
export class UserApplicationScopeModalComponent implements OnInit {
    @Input() scope: ApplicationScope;
    @Input() scopeGroups: ApplicationScopeGroup[];
    @Output() save = new EventEmitter<ApplicationScope>();

    form: FormGroup;

    trackByFn = trackByFn;

    constructor(private _formBuilder: FormBuilder) {}

    ngOnInit(): void {
        this._buildForm();
    }

    private _buildForm(): void {
        this.form = this._formBuilder.group({
            id: this.scope ? this.scope.id : Guid.create().toString(),
            name: [this.scope ? this.scope.name : '', Validators.required],
            description: [this.scope ? this.scope.description : ''],
            scopeGroupId: [this.scope ? this.scope.scopeGroupId : ''],
        });
    }

    onSave(): void {
        this.save.emit(this.form.getRawValue());
    }
}
