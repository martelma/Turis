import { CommonModule } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCalendar, MatCalendarCellClassFunction, MatDatepickerModule } from '@angular/material/datepicker';
import { WatchCalendarNavigationDirective } from './watch-calendar-navigation.pipe';

export interface CalendarEventData {
    primary: number; // Contatore principale (badge blu/predefinito)
    secondary?: number; // Contatore secondario (badge giallo)
}

@Component({
    selector: 'app-calendar-badges',
    standalone: true,
    imports: [CommonModule, MatDatepickerModule, MatNativeDateModule, WatchCalendarNavigationDirective],
    templateUrl: './calendar-badges.component.html',
    styleUrls: ['./calendar-badges.component.scss'],
})
export class CalendarBadgesComponent implements OnChanges {
    @Input() events = new Map<string, CalendarEventData>([]);
    @Input() startDate: Date; //= getFirstDayOfMonth(new Date());
    @Input() selectedDate: Date = new Date();
    @Output() dateSelected = new EventEmitter<{ date: Date; eventCount: number; secondaryEventCount: number }>();
    @Output() viewChanged = new EventEmitter<Date>();

    @ViewChild(MatCalendar) calendar?: MatCalendar<Date>;

    activeDate: Date = new Date();

    constructor(private _changeDetectorRef: ChangeDetectorRef) {}

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

        if (changes['startDate'] && changes['startDate'].currentValue) {
            // Update the active date to reflect the new start date
            this.activeDate = new Date(changes['startDate'].currentValue);

            setTimeout(() => {
                // Force calendar to update its view to the new month
                if (this.calendar) {
                    this.calendar.activeDate = this.activeDate;
                    this.calendar.updateTodaysDate();
                }
                this._changeDetectorRef.detectChanges();
            }, 0);
        }
    }

    private clearAllBadges(): void {
        const cells = document.querySelectorAll('.mat-calendar-body-cell');
        cells.forEach(cell => {
            cell.removeAttribute('data-badge');
            cell.removeAttribute('data-secondary-badge');
            cell.classList.remove('has-events', 'has-primary-events', 'has-secondary-events');
            // Remove custom badge containers
            const customBadges = cell.querySelectorAll('.custom-badge-container, .custom-badge');
            customBadges.forEach(badge => badge.remove());
        });
    }

    // Function that returns CSS class for each calendar cell
    dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
        // Only apply to month view
        if (view === 'month') {
            const dateKey = this.formatDateKey(cellDate);
            const eventData = this.events.get(dateKey);

            if (eventData && (eventData.primary > 0 || (eventData.secondary && eventData.secondary > 0))) {
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
                                // Clear existing badges and custom badges
                                (parentCell as HTMLElement).removeAttribute('data-badge');
                                (parentCell as HTMLElement).removeAttribute('data-secondary-badge');
                                const existingBadges = parentCell?.querySelectorAll('.custom-badge');
                                existingBadges?.forEach(badge => badge.remove());

                                // SEMPRE creiamo i badge via JavaScript per controllo totale
                                const badgeContainer = document.createElement('div');
                                badgeContainer.className = 'custom-badge-container';
                                badgeContainer.style.cssText = `
                                    position: absolute !important;
                                    top: 2px !important;
                                    right: 2px !important;
                                    left: auto !important;
                                    display: flex !important;
                                    gap: 2px !important;
                                    z-index: 15 !important;
                                    margin: 0 !important;
                                    padding: 0 !important;
                                `;

                                // Se c'è il badge secondario, crealo per primo (sarà a sinistra)
                                if (eventData.secondary && eventData.secondary > 0) {
                                    const yellowBadge = document.createElement('div');
                                    yellowBadge.className = 'custom-badge';
                                    yellowBadge.textContent = eventData.secondary.toString();
                                    yellowBadge.style.cssText = `
                                        background-color: #eab308 !important;
                                        color: white !important;
                                        border-radius: 50% !important;
                                        width: 16px !important;
                                        height: 16px !important;
                                        font-size: 9px !important;
                                        font-weight: 700 !important;
                                        display: flex !important;
                                        align-items: center !important;
                                        justify-content: center !important;
                                        line-height: 1 !important;
                                        box-shadow: 0 1px 3px 0 rgba(0,0,0,0.3) !important;
                                        margin: 0 !important;
                                        padding: 0 !important;
                                    `;
                                    badgeContainer.appendChild(yellowBadge);
                                }

                                // Se c'è il badge primario, crealo (sarà a destra del giallo, o da solo)
                                if (eventData.primary > 0) {
                                    const redBadge = document.createElement('div');
                                    redBadge.className = 'custom-badge';
                                    redBadge.textContent = eventData.primary.toString();
                                    redBadge.style.cssText = `
                                        background-color: #ef4444 !important;
                                        color: white !important;
                                        border-radius: 50% !important;
                                        width: 16px !important;
                                        height: 16px !important;
                                        font-size: 9px !important;
                                        font-weight: 700 !important;
                                        display: flex !important;
                                        align-items: center !important;
                                        justify-content: center !important;
                                        line-height: 1 !important;
                                        box-shadow: 0 1px 3px 0 rgba(0,0,0,0.3) !important;
                                        margin: 0 !important;
                                        padding: 0 !important;
                                    `;
                                    badgeContainer.appendChild(redBadge);
                                }

                                (parentCell as HTMLElement).appendChild(badgeContainer);
                            }
                        }
                    });
                }, 0);

                let classes = 'has-events';
                if (eventData.primary > 0) classes += ' has-primary-events';
                if (eventData.secondary && eventData.secondary > 0) classes += ' has-secondary-events';

                return classes;
            }
        }
        return '';
    };

    onViewChanged(date: Date | string): void {
        const parsedDate = typeof date === 'string' ? new Date(date) : date;

        const utcDate = new Date(Date.UTC(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()));

        this.viewChanged.emit(utcDate);
    }

    onDateSelected(date: Date): void {
        const eventCount = this.getEventCount(date);
        const secondaryEventCount = this.getSecondaryEventCount(date);

        const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

        this.dateSelected.emit({
            date: utcDate,
            eventCount,
            secondaryEventCount,
        });
    }

    getEventCount(date: Date): number {
        const dateKey = this.formatDateKey(date);
        const eventData = this.events.get(dateKey);
        return eventData ? eventData.primary : 0;
    }

    getSecondaryEventCount(date: Date): number {
        const dateKey = this.formatDateKey(date);
        const eventData = this.events.get(dateKey);
        return eventData?.secondary || 0;
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
