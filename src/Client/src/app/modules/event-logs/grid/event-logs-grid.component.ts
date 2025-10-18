import { DatePipe, NgClass, NgIf } from '@angular/common';
import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { EventLogsService } from '../event-logs.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { EventLog } from 'app/shared/event-log';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { PaginatedListResult } from 'app/shared/services/shared.types';
import { Observable, of, tap, switchMap, catchError, throwError, finalize, debounceTime } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SearchInputComponent } from 'app/components/global-shortcuts/ui/search-input/search-input.component';
import { UserDateFormats } from 'app/constants';

@UntilDestroy()
@Component({
    selector: 'app-event-logs-grid',
    templateUrl: './event-logs-grid.component.html',
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
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        TranslocoModule,
        SearchInputComponent,
    ],
})
export class EventLogsGridComponent implements OnInit, OnDestroy, AfterViewInit {
    loading = false;

    debounce = 500;
    searchControl = new FormControl<string>('');
    userDateFormats = UserDateFormats;

    @Input() entityName: string;
    @Input() entityKey: string;

    columnsToDisplay = ['user', 'timeStamp', 'entityKey', 'eventName', 'additionalInfo'];
    dataSource: MatTableDataSource<EventLog>;
    expandedElement: EventLog[] = [];

    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) private paginator: MatPaginator;

    pageIndex = 0;
    pageSize = 15;
    totalCount = 0;
    pageSizeOptions = [10, 15, 20, 30];

    paginatedResult: PaginatedListResult<EventLog> = {
        items: [],
        totalCount: 0,
        pageIndex: 0,
        pageSize: 15,
        hasNextPage: false,
    };

    constructor(
        private eventLogsService: EventLogsService,
        private translocoService: TranslocoService,
        public snackBar: MatSnackBar,
    ) {}

    ngOnInit(): void {
        this.searchControl.valueChanges
            .pipe(
                debounceTime(this.debounce),
                untilDestroyed(this),
                switchMap(() => this.loadData$(true)),
            )
            .subscribe();
    }

    ngAfterViewInit(): void {
        this.loadData$().subscribe();

        this.sort.sortChange
            .pipe(
                untilDestroyed(this),
                switchMap(() => this.loadData$()),
            )
            .subscribe();
    }

    ngOnDestroy(): void {}

    onPageChanged(event: PageEvent): void {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;

        this.loadData$().subscribe();
    }

    drillDown(element: any) {
        this.expandedElement = this.expandedElement === element ? null : element;
        // this.detail = element.details;
    }

    refresh(): void {
        of(void 0)
            .pipe(
                tap(() => {
                    this.loading = true;
                    // this.selectedModel = null;
                }),
                switchMap(() => this.loadData$(true)),
                finalize(() => {
                    this.loading = false;
                }),
            )
            .subscribe();
    }

    loadData$(resetPageIndex = false): Observable<PaginatedListResult<EventLog>> {
        return of(void 0).pipe(
            tap(() => {
                this.loading = true;
            }),
            switchMap(() => {
                return this.eventLogsService.loadData$({
                    pageIndex: resetPageIndex ? 0 : this.paginator?.pageIndex,
                    pageSize: this.paginator?.pageSize,
                    pattern: this.searchControl.value,
                    entityName: this.entityName,
                    entityKey: this.entityKey,
                });
            }),
            catchError(error => {
                console.error(error);
                this.snackBar.open(error.message, this.translocoService.translate('General.Dismiss'), {
                    panelClass: ['error'],
                });
                return throwError(() => new Error(error));
            }),
            tap(paginatedResults => {
                // console.log('paginatedResults', paginatedResults);
                this.paginatedResult = paginatedResults;
                this.dataSource = new MatTableDataSource(paginatedResults?.items ?? []);
            }),
            finalize(() => {
                this.loading = false;
            }),
        );
    }
}
