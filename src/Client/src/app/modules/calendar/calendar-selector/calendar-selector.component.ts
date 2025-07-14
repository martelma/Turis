import { CommonModule, CurrencyPipe, JsonPipe, NgClass, NgFor, NgIf, NgStyle, NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { UntilDestroy } from '@ngneat/until-destroy';
import { SearchInputComponent } from 'app/shared/components/ui/search-input/search-input.component';
import { ServiceService } from 'app/modules/service/service.service';
import { MaterialModule } from 'app/modules/material.module';
import { FullCalendarModule } from '@fullcalendar/angular';
import { ServiceSidebarComponent } from 'app/modules/service/service-sidebar/service-sidebar.component';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserSettingsService } from 'app/shared/services/user-setting.service';
import { CalendarViewGridComponent } from '../calendar-view-grid/calendar-view-grid.component';
import { MatCalendar, MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';

@UntilDestroy()
@Component({
    selector: 'app-calendar-selector',
    templateUrl: './calendar-selector.component.html',
    styleUrls: ['./calendar-selector.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        NgStyle,
        CurrencyPipe,
        RouterLink,
        FormsModule,
        ReactiveFormsModule,
        MatDatepickerModule,
        MatProgressBarModule,
        MatFormFieldModule,
        MatCardModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatSortModule,
        NgTemplateOutlet,
        MatPaginatorModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatOptionModule,
        MatCheckboxModule,
        MatRippleModule,
        MatTooltipModule,
        TranslocoModule,
        SearchInputComponent,
        JsonPipe,
        SearchInputComponent,
        CommonModule,
        MaterialModule,
        FullCalendarModule,
        FuseDrawerComponent,
        ServiceSidebarComponent,
        CalendarViewGridComponent,
    ],
})
export class CalendarSelectorComponent implements OnInit, OnDestroy {
    @ViewChild(MatCalendar) calendar!: MatCalendar<Date>;

    @Input() date: Date = new Date();
    @Output() onDateChanged: EventEmitter<Date> = new EventEmitter<Date>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
        private _serviceService: ServiceService,
        private _translocoService: TranslocoService,
        private _sanitizer: DomSanitizer,
        private _userSettingsService: UserSettingsService,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
    ) {}

    ngOnInit(): void {
        if (!(this.date instanceof Date)) {
            this.date = new Date();
        }
    }

    ngOnDestroy() {}

    preview() {
        const newDate = new Date(this.date);
        newDate.setDate(this.date.getDate() - 1);

        this.date = newDate;

        if (this.calendar) {
            this.calendar._goToDateInView(this.date, 'month');
        }

        this.onDateChanged.emit(this.date);
    }

    next() {
        const newDate = new Date(this.date);
        newDate.setDate(this.date.getDate() + 1);

        this.date = newDate;

        if (this.calendar) {
            this.calendar._goToDateInView(this.date, 'month');
        }

        this.onDateChanged.emit(this.date);
    }

    onDateChange(newDate: Date): void {
        this.date = newDate;
        // console.log('Data aggiornata:', this.date);
        this.onDateChanged.emit(this.date);
    }
}
