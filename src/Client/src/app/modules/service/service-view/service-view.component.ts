import { Component, Input, OnChanges, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { TranslocoModule } from '@ngneat/transloco';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { FuseScrollResetDirective } from '@fuse/directives/scroll-reset';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { DatePipe, JsonPipe, NgFor, NgIf } from '@angular/common';
import { UntilDestroy } from '@ngneat/until-destroy';
import { ServiceService } from '../service.service';
import { Service } from '../service.types';
import { MatExpansionModule } from '@angular/material/expansion';

@UntilDestroy()
@Component({
    selector: 'app-service-view',
    templateUrl: './service-view.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./service-view.component.scss'],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DatePipe,
        JsonPipe,
        FormsModule,
        ReactiveFormsModule,
        MatTabsModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatExpansionModule,
        FuseScrollResetDirective,
        TranslocoModule,
    ],
})
export class ServiceViewComponent implements OnInit, OnChanges {
    item: Service;
    @Input()
    set service(value: Service) {
        this.item = value;
    }

    get service(): Service {
        return this.item;
    }

    @ViewChild(MatTabGroup) matTabGroup: MatTabGroup;

    form: UntypedFormGroup;

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _serviceService: ServiceService,
    ) {}

    ngOnChanges(): void {}

    ngOnInit(): void {
        // Create the form
        this.form = this._formBuilder.group({});
    }

    onSelectedTabChange(): void {}
}
