import { DatePipe, KeyValuePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { EventLogViewMode } from 'app/constants';
import { UserService } from 'app/core/user/user.service';
import { EventLog } from 'app/shared/event-log';
import { userDateFormats } from 'app/shared/services/shared.types';
import { EventLogsService } from '../event-logs.service';
import { EventLogsGridComponent } from '../grid/event-logs-grid.component';
import { EventLogsListComponent } from '../list/event-logs-list.component';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
    selector: 'app-event-logs',
    templateUrl: './event-logs.component.html',
    styleUrls: ['./event-logs.component.scss'],
    standalone: true,
    imports: [
        NgFor,
        NgIf,
        NgClass,
        DatePipe,
        KeyValuePipe,
        MatIconModule,
        TranslocoModule,
        EventLogsGridComponent,
        EventLogsListComponent,
    ],
})
export class EventLogsComponent implements OnInit, OnChanges {
    @Input() entityName: string;
    @Input() entityKey: string;

    mode: EventLogViewMode = 'grid';

    eventLogs: EventLog[];

    groupedEventMap: Map<Date, EventLog[]>;

    userDateFormats = userDateFormats;

    constructor(
        protected userService: UserService,
        private eventLogsService: EventLogsService,
    ) {}

    ngOnInit(): void {}

    ngOnChanges(): void {
        this.groupedEventMap = this.eventLogs?.reduce(
            (entryMap, e) => entryMap.set(e.date, [...(entryMap.get(e.date) || []), e]),
            new Map(),
        );
    }
}
