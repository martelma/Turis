import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { SearchInputComponent } from 'app/components/global-shortcuts/ui/search-input/search-input.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { debounceTime, map } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { toUtcString } from 'app/shared';
import { ContactService } from '../contact.service';
import { ContactSearchParameters } from '../contact.types';

@UntilDestroy()
@Component({
    selector: 'app-contact-sidebar',
    templateUrl: './contact-sidebar.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        NgIf,
        NgFor,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatInputModule,
        MatSelectModule,
        TranslocoModule,
        SearchInputComponent,
    ],
})
export class ContactSidebarComponent implements OnInit {
    @Input() debounce = 300;

    contactParameters: ContactSearchParameters;

    filters = this._formBuilder.group({
        code: [''],
        firstName: [''],
        lastName: [''],
        companyName: [''],
        note: [''],
    });

    constructor(
        private _contactService: ContactService,
        private _formBuilder: FormBuilder,
    ) {}

    ngOnInit(): void {
        this._subscribeFilterValueChanges();
        this._subscribeServiceParameters();
    }

    private _subscribeServiceParameters(): void {
        this._contactService.contactParameters$
            .pipe(untilDestroyed(this))
            .subscribe((contactParameters: ContactSearchParameters) => {
                this.contactParameters = contactParameters;
            });
    }

    private _subscribeFilterValueChanges(): void {
        this.filters.valueChanges
            .pipe(
                debounceTime(this.debounce),
                map(value => value),
                untilDestroyed(this),
            )
            .subscribe(value => {
                // console.log('_subscribeFilterValueChanges', value);
                this._search(value);
            });
    }

    filter() {
        // console.log('serviceParameters', this.contactParameters);
        // console.log('filter', event);

        this._search(this.contactParameters);
    }

    clearFilters() {
        this.contactParameters = new ContactSearchParameters();

        this.filter();
    }

    _search(contactParameters: ContactSearchParameters): void {
        this._contactService
            .listEntities({ ...this.contactParameters, ...contactParameters, pageIndex: 0 })
            .pipe(untilDestroyed(this))
            .subscribe();
    }
}
