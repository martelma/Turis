import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdModalComponent } from 'app/shared/components/cd-modal/cd-modal.component';
import { MatSelectModule } from '@angular/material/select';
import { ApplicationScopeGroup } from 'app/modules/admin/applications/applications.types';
import { Guid } from 'guid-typescript';
import { TranslocoModule } from '@jsverse/transloco';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
    selector: 'user-application-scope-group-modal',
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
    templateUrl: './scope-group-modal.component.html',
})
export class UserApplicationScopeGroupModalComponent implements OnInit {
    @Input() scopeGroup: ApplicationScopeGroup;
    @Output() save = new EventEmitter<ApplicationScopeGroup>();

    form: FormGroup;

    constructor(private _formBuilder: FormBuilder) {}

    ngOnInit(): void {
        this._buildForm();
    }

    private _buildForm(): void {
        this.form = this._formBuilder.group({
            id: this.scopeGroup ? this.scopeGroup.id : Guid.create().toString(),
            name: [this.scopeGroup ? this.scopeGroup.name : '', Validators.required],
            description: [this.scopeGroup ? this.scopeGroup.description : ''],
        });
    }

    onSave(): void {
        this.save.emit(this.form.getRawValue());
    }
}
