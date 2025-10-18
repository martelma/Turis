import { AfterViewInit, Directive, EventEmitter, Output } from '@angular/core';
import { MatCalendar } from '@angular/material/datepicker';

@Directive({
    selector: '[watchCalendarNavigation]',
    standalone: true,
})
export class WatchCalendarNavigationDirective implements AfterViewInit {
    @Output() viewChanged = new EventEmitter<Date>();

    private previousActiveDate: Date;

    constructor(private calendar: MatCalendar<Date>) {}

    ngAfterViewInit(): void {
        this.previousActiveDate = this.calendar.activeDate;

        this.calendar.stateChanges.subscribe(() => {
            const currentActiveDate = this.calendar.activeDate;

            // Compare year and month only
            if (
                currentActiveDate.getFullYear() !== this.previousActiveDate.getFullYear() ||
                currentActiveDate.getMonth() !== this.previousActiveDate.getMonth()
            ) {
                this.previousActiveDate = currentActiveDate;
                this.viewChanged.emit(currentActiveDate);
            }
        });
    }
}
