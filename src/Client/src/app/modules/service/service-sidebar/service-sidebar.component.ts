import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ServiceService } from '../service.service';
import { SearchInputComponent } from 'app/shared/components/ui/search-input/search-input.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { ServiceSearchParameters } from '../service.types';
import { DurationTypes, MY_DATE_FORMATS, ServiceTypes } from 'app/constants';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { toUtcString } from 'app/shared';
import {
    DateAdapter,
    MAT_DATE_FORMATS,
    MAT_DATE_LOCALE,
    MatNativeDateModule,
    MatOptionModule,
} from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Language } from 'app/modules/configuration/languages/language.types';
import { LanguageService } from 'app/modules/configuration/languages/language.service';

@UntilDestroy()
@Component({
    selector: 'app-service-sidebar',
    templateUrl: './service-sidebar.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    providers: [
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
        { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    ],
    imports: [
        CommonModule,
        NgIf,
        NgFor,
        FormsModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSelectModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatOptionModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        TranslocoModule,
        SearchInputComponent,
    ],
})
export class ServiceSidebarComponent implements OnInit {
    @Input() debounce = 300;
    @Output() onFilterChanged = new EventEmitter<ServiceSearchParameters>();

    dateFrom: Date;
    dateTo: Date;
    serviceParameters: ServiceSearchParameters;

    languages: Language[] = [];

    minDate = new Date(2020, 0, 1); // 1 gennaio 2020
    maxDate = new Date(2030, 11, 31); // 31 dicembre 2030

    serviceTypes = ServiceTypes;
    durationTypes = DurationTypes;

    constructor(
        private _serviceService: ServiceService,
        private _languageService: LanguageService,
    ) {}

    ngOnInit(): void {
        // this._subscribeFilterValueChanges();
        this._subscribeServiceParameters();
        this.loadLanguages();
    }

    private _subscribeServiceParameters(): void {
        this._serviceService.serviceParameters$
            .pipe(untilDestroyed(this))
            .subscribe((serviceParameters: ServiceSearchParameters) => {
                this.serviceParameters = serviceParameters;
            });
    }

    loadLanguages() {
        this._languageService
            .listEntities()
            .pipe(untilDestroyed(this))
            .subscribe(list => {
                this.languages = list.items;
            });
    }

    // private _subscribeFilterValueChanges(): void {
    //     this.filters.valueChanges
    //         .pipe(
    //             debounceTime(this.debounce),
    //             map(value => value),
    //             untilDestroyed(this),
    //         )
    //         .subscribe(value => {
    //             console.log('_subscribeFilterValueChanges', value);
    //             this._search(value);
    //         });
    // }

    clearFilters() {
        this.serviceParameters = new ServiceSearchParameters();
        this.dateFrom = null;
        this.dateTo = null;

        this.filter();
    }

    filter() {
        console.log('serviceParameters', this.serviceParameters);
        this.serviceParameters.dateFrom = toUtcString(this.dateFrom);
        this.serviceParameters.dateTo = toUtcString(this.dateTo);
        this._search(this.serviceParameters);
    }

    // dateFromChanged(event: any) {
    //     console.log('dateFromChanged-evet', event);
    //     if (event.value === '') {
    //         this.serviceParameters.dateFrom = '';
    //     } else {
    //         this.serviceParameters.dateFrom = toUtcString(event.value);
    //     }
    //     this._search(this.serviceParameters);
    // }

    // dateToChanged(event: any) {
    //     console.log('dateFromChanged-evet', event);
    //     if (event.value === '') {
    //         this.serviceParameters.dateTo = '';
    //     } else {
    //         this.serviceParameters.dateTo = toUtcString(event.value);
    //     }
    //     this._search(this.serviceParameters);
    // }

    _search(serviceParameters: ServiceSearchParameters): void {
        this._serviceService
            .listEntities({ ...this.serviceParameters, ...serviceParameters, pageIndex: 0 })
            .pipe(untilDestroyed(this))
            .subscribe();
    }
}
