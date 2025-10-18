import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { SearchInputComponent } from 'app/components/ui/search-input/search-input.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { JournalEntrySearchParameters } from '../journal-entry.types';
import { DurationTypes, MY_DATE_FORMATS } from 'app/constants';
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
import { JournalEntryService } from '../journal-entry.service';

@UntilDestroy()
@Component({
    selector: 'app-journal-entry-sidebar',
    templateUrl: './journal-entry-sidebar.component.html',
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
export class JournalEntrySidebarComponent implements OnInit {
    @Input() debounce = 300;
    @Output() onFilterChanged = new EventEmitter<JournalEntrySearchParameters>();

    dateFrom: Date;
    dateTo: Date;
    parameters: JournalEntrySearchParameters;

    languages: Language[] = [];

    minDate = new Date(2020, 0, 1); // 1 gennaio 2020
    maxDate = new Date(2030, 11, 31); // 31 dicembre 2030

    durationTypes = DurationTypes;

    constructor(private _journalEntryService: JournalEntryService) {}

    ngOnInit(): void {
        this._subscribeJournalEntryParameters();
    }

    private _subscribeJournalEntryParameters(): void {
        this._journalEntryService.parameters$
            .pipe(untilDestroyed(this))
            .subscribe((journalEntryParameters: JournalEntrySearchParameters) => {
                this.parameters = journalEntryParameters;
            });
    }

    clearFilters() {
        this.parameters = new JournalEntrySearchParameters();
        this.dateFrom = null;
        this.dateTo = null;

        this.filter();
    }

    filter() {
        this.parameters.dateFrom = toUtcString(this.dateFrom);
        this.parameters.dateTo = toUtcString(this.dateTo);
        this._search(this.parameters);
    }

    _search(JournalEntryParameters: JournalEntrySearchParameters): void {
        this._journalEntryService
            .listEntities({ ...this.parameters, ...JournalEntryParameters, pageIndex: 0 })
            .pipe(untilDestroyed(this))
            .subscribe();
    }
}
