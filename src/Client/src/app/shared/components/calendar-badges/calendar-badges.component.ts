import { CommonModule } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { MatCalendar, MatCalendarCellClassFunction, MatDatepickerModule } from '@angular/material/datepicker';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { WatchCalendarNavigationDirective } from './watch-calendar-navigation.pipe';
import { TranslocoService } from '@ngneat/transloco';
import { CalendarInfo } from 'app/modules/service/service.types';

@UntilDestroy()
@Component({
    selector: 'app-calendar-badges',
    standalone: true,
    imports: [CommonModule, MatDatepickerModule, MatNativeDateModule, WatchCalendarNavigationDirective],
    templateUrl: './calendar-badges.component.html',
    styleUrls: ['./calendar-badges.component.scss'],
})
export class CalendarBadgesComponent implements OnChanges, OnInit {
    @Input() events = new Map<string, number>([]);
    @Output() dateSelected = new EventEmitter<{ date: Date; eventCount: number }>();
    @Output() viewChanged = new EventEmitter<{ date: Date; dateFrom: Date; dateTo: Date }>();

    @ViewChild(MatCalendar) calendar?: MatCalendar<Date>;

    selectedDate: Date | null = null;

    activeDate: Date = new Date();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _translocoService: TranslocoService,
        private _dateAdapter: DateAdapter<any>,
    ) {}

    ngOnInit(): void {
        this._subscribeLangChanges();

        // Emetti l'evento iniziale per il mese corrente
        setTimeout(() => {
            this.onViewChanged(this.activeDate);
        }, 0);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['events']) {
            // Clear old badges
            setTimeout(() => {
                this.clearAllBadges();

                // Force Angular to re-run change detection
                this._changeDetectorRef.detectChanges();

                // Force calendar to update its view
                if (this.calendar) {
                    this.calendar.updateTodaysDate();
                }
            }, 0);
        }
    }

    private _subscribeLangChanges(): void {
        // Subscribe to language changes
        this._translocoService.langChanges$.pipe(untilDestroyed(this)).subscribe(activeLang => {
            this._dateAdapter.setLocale(activeLang);
        });
    }

    private clearAllBadges(): void {
        const cells = document.querySelectorAll('.mat-calendar-body-cell');
        cells.forEach(cell => {
            cell.removeAttribute('data-badge');
            cell.classList.remove('has-events');
        });
    }

    // Function that returns CSS class for each calendar cell
    dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
        // Only apply to month view
        if (view === 'month') {
            const dateKey = this.formatDateKey(cellDate);
            const eventCount = this.events.get(dateKey);

            if (eventCount && eventCount > 0) {
                // Use setTimeout to ensure DOM is ready
                setTimeout(() => {
                    const cells = document.querySelectorAll('.mat-calendar-body-cell');
                    cells.forEach(cell => {
                        const button = cell.querySelector('.mat-calendar-body-cell-content');
                        if (button && button.textContent?.trim() === cellDate.getDate().toString()) {
                            const parentCell = button.closest('.mat-calendar-body-cell');
                            const ariaLabel = parentCell?.getAttribute('aria-label');

                            // Match the date to ensure we're updating the right cell
                            if (ariaLabel?.includes(cellDate.getDate().toString())) {
                                // Add data-badge to the parent cell instead of button
                                (parentCell as HTMLElement).setAttribute('data-badge', eventCount.toString());
                            }
                        }
                    });
                }, 0);

                return 'has-events';
            }
        }
        return '';
    };

    onViewChanged(date: Date | string): void {
        const parsedDate = typeof date === 'string' ? new Date(date) : date;

        const utcDate = new Date(Date.UTC(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()));

        // Calcola dateFrom (primo giorno del mese visualizzato)
        const dateFrom = new Date(Date.UTC(parsedDate.getFullYear(), parsedDate.getMonth(), 1));

        // Calcola dateTo (primo giorno del mese successivo)
        const dateTo = new Date(Date.UTC(parsedDate.getFullYear(), parsedDate.getMonth() + 1, 1));

        const data = {
            date: utcDate,
            dateFrom: dateFrom,
            dateTo: dateTo,
        };
        console.log('onViewChanged', data);

        this.viewChanged.emit(data);
    }

    onDateSelected(date: Date): void {
        const eventCount = this.getEventCount(date);

        const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

        const data = {
            date: utcDate,
            eventCount,
        };
        console.log('onDateSelected', data);

        this.dateSelected.emit(data);
    }

    getEventCount(date: Date): number {
        const dateKey = this.formatDateKey(date);
        return this.events.get(dateKey) || 0;
    }

    private formatDateKey(date: Date): string {
        if (!date) {
            return '';
        }

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}
