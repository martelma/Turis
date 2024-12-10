import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdModalComponent } from 'app/shared/components/cd-modal/cd-modal.component';
import { ApplicationScopeGroup } from '../../applications.types';
import { Guid } from 'guid-typescript';
import { A11yModule } from '@angular/cdk/a11y';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
    selector: 'scope-group-modal',
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
        CdModalComponent,
        TranslocoModule,
        A11yModule,
    ],
    templateUrl: './scope-group-modal.component.html',
    styleUrls: ['./scope-group-modal.component.scss'],
})
export class ScopeGroupModalComponent implements OnInit {
    @Input() scopeGroup: ApplicationScopeGroup;
    @Output() save = new EventEmitter<ApplicationScopeGroup>();

    form: FormGroup;

    constructor(private _formBuilder: FormBuilder) {}

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            id: [this.scopeGroup ? this.scopeGroup.id : Guid.create().toString(), Validators.required],
            name: [this.scopeGroup ? this.scopeGroup.name : '', Validators.required],
            description: [this.scopeGroup ? this.scopeGroup.description : ''],
        });
    }

    onSave(): void {
        this.save.emit(this.form.getRawValue());
    }
}
