import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CalendarService } from '../calendar.service';
import { SearchInputComponent } from 'app/shared/components/ui/search-input/search-input.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, map } from 'rxjs/operators';
import { UserService } from 'app/core/user/user.service';
import { NgIf } from '@angular/common';
import { LanguageFiltersComponent } from 'app/modules/configuration/languages/language-filters/language-filters.component';
import { CalendarSearchParameters } from '../calendar.types';
import { Language } from 'highlight.js';

@UntilDestroy()
@Component({
    selector: 'app-calendar-sidebar',
    templateUrl: './calendar-sidebar.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        NgIf,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatCheckboxModule,
        MatInputModule,
        TranslocoModule,
        LanguageFiltersComponent,
        SearchInputComponent,
    ],
})
export class CalendarSidebarComponent implements OnInit {
    @Input() debounce = 300;

    calendarParameters: CalendarSearchParameters;

    filters = this._formBuilder.group({
        onlyCreatedByMe: false,
        onlyPublished: false,
    });

    constructor(
        private _calendarService: CalendarService,
        private _formBuilder: FormBuilder,
        private _userService: UserService,
    ) {}

    ngOnInit(): void {
        // Calendar Parameters
        this._subscribeCalendarParameters();

        // Form Value Changes
        this._subscribeToFormValueChanges();
    }

    private _subscribeCalendarParameters(): void {
        this._calendarService.serviceParameters$
            .pipe(untilDestroyed(this))
            .subscribe((calendarParameters: CalendarSearchParameters) => {
                this.calendarParameters = calendarParameters;
            });
    }

    private _subscribeToFormValueChanges(): void {
        this.filters.valueChanges
            .pipe(
                debounceTime(this.debounce),
                map(value => value),
                untilDestroyed(this),
            )
            .subscribe(value => {
                this._search(value);
            });
    }

    onlanguagesSelectionChange(selectedlanguages: Language[]): void {
        this._search({ selectedlanguageIds: selectedlanguages.map(x => x.id).join(',') });
    }

    private _search(calendarParameters: CalendarSearchParameters): void {
        this._calendarService
            .listEntities({ ...this.calendarParameters, ...calendarParameters, pageIndex: 0 })
            .pipe(untilDestroyed(this))
            .subscribe();
    }
}
