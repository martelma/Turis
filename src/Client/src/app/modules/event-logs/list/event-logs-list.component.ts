import { DatePipe, NgClass, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UntilDestroy } from '@ngneat/until-destroy';
import { EventLogsService } from '../event-logs.service';
import { SearchInputComponent } from 'app/components/global-shortcuts/ui/search-input/search-input.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';

@UntilDestroy()
@Component({
    selector: 'app-event-logs-list',
    templateUrl: './event-logs-list.component.html',
    standalone: true,
    imports: [
        NgIf,
        NgClass,
        ReactiveFormsModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        DatePipe,
        TranslocoModule,
        SearchInputComponent,
    ],
})
export class EventLogsListComponent {
    @Input() entityName: string;

    private _entityKey: string;
    @Input()
    set entityKey(value: string) {
        this._entityKey = value;
        if (value) {
            // this.eventLogsService.loadData$(this.entityName, value).subscribe(data => {
            //     console.log('loaded', data);
            // });
        }
    }
    get entityKey(): string {
        return this._entityKey;
    }

    constructor(private eventLogsService: EventLogsService) {}
}
