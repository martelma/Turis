import { DatePipe, KeyValuePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { EventLogViewMode } from 'app/constants';
import { UserService } from 'app/core/user/user.service';
import { EventLog } from 'app/shared/event-log';
import { EventLogService } from 'app/shared/services/event-log.service';
import { userDateFormats } from 'app/shared/services/shared.types';

@Component({
    selector: 'app-service-event-log',
    templateUrl: './service-event-log.component.html',
    styleUrls: ['./service-event-log.component.scss'],
    standalone: true,
    imports: [NgFor, NgIf, NgClass, DatePipe, KeyValuePipe, MatIconModule],
})
export class ServiceEventLogComponent implements OnInit, OnChanges {
    @Input() entityName: string;
    @Input() entityKey: string;

    mode: EventLogViewMode = 'grid';

    eventLogs: EventLog[];

    groupedEventMap: Map<Date, EventLog[]>;

    userDateFormats = userDateFormats;

    constructor(
        protected userService: UserService,
        private eventLogService: EventLogService,
    ) {}

    ngOnInit(): void {
        this.loadData();
    }

    ngOnChanges(): void {
        this.groupedEventMap = this.eventLogs?.reduce(
            (entryMap, e) => entryMap.set(e.date, [...(entryMap.get(e.date) || []), e]),
            new Map(),
        );
    }

    public loadData(): void {
        this.eventLogService.loadData(this.entityName, this.entityKey).subscribe(data => {
            this.eventLogs = data;
            console.log('Event logs loaded:', this.eventLogs);
        });
    }
}
