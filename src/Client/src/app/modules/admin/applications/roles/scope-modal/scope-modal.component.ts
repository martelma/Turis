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
import { trackByFn } from 'app/shared';
import { ApplicationScope, ApplicationScopeGroup } from '../../applications.types';
import { Guid } from 'guid-typescript';
import { TranslocoModule } from '@ngneat/transloco';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
    selector: 'application-role-scope-modal',
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
        TranslocoModule,
        CdModalComponent,
        TranslocoModule,
        A11yModule,
    ],
    templateUrl: './scope-modal.component.html',
})
export class ApplicationRoleScopeModalComponent implements OnInit {
    @Input() scope: ApplicationScope;
    @Input() scopeGroups: ApplicationScopeGroup[];
    @Output() save = new EventEmitter<ApplicationScope>();

    form: FormGroup;

    trackByFn = trackByFn;

    constructor(private _formBuilder: FormBuilder) {}

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            id: [this.scope ? this.scope.id : Guid.create().toString(), Validators.required],
            name: [this.scope ? this.scope.name : '', Validators.required],
            description: [this.scope ? this.scope.description : ''],
            scopeGroupId: [this.scope ? this.scope.scopeGroupId : ''],
        });
    }

    onSave(): void {
        this.save.emit(this.form.getRawValue());
    }
}
