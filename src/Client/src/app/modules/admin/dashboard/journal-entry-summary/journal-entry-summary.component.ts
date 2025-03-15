import { CommonModule, CurrencyPipe, NgClass } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MaterialModule } from 'app/modules/material.module';
import { User } from 'app/core/user/user.types';
import { ActivatedRoute, Router } from '@angular/router';
import { JournalEntryService } from 'app/modules/journal-entry/journal-entry.service';
import { JournalEntrySummary } from '../dashboard.types';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { MatButtonToggleChange, MatButtonToggleGroup } from '@angular/material/button-toggle';

@UntilDestroy()
@Component({
    selector: 'app-journal-entry-summary',
    standalone: true,
    templateUrl: './journal-entry-summary.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [NgClass, CurrencyPipe, CommonModule, FormsModule, MaterialModule, TranslocoModule, NgApexchartsModule],
})
export class JournalEntrySummaryComponent implements OnInit, AfterViewInit {
    public user: User;
    public isScreenSmall: boolean;

    journalEntrySummary: JournalEntrySummary;

    chartData: ApexOptions = {};

    @ViewChild('summarySelector') summarySelector: MatButtonToggleGroup;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _journalEntryService: JournalEntryService,
        private _router: Router,
    ) {}

    ngOnInit(): void {
        this._journalEntryService.journalEntrySummary$
            .pipe(untilDestroyed(this))
            .subscribe((data: JournalEntrySummary) => {
                this.journalEntrySummary = data;
            });
        this.loadData();
    }

    ngAfterViewInit() {
        // if (!this.summarySelector.value) {
        //     this.summarySelector.value = 'monthData'; // Imposta un valore predefinito
        // }
        // console.log('Valore inizializzato:', this.summarySelector.value);

        this.loadData();
    }

    onToggleChange(event: MatButtonToggleChange): void {
        this.prepareChartData();
    }

    loadData(): void {
        console.log('loadData');
        this._journalEntryService
            .summary()
            .pipe(untilDestroyed(this))
            .subscribe(items => {
                this.journalEntrySummary = items;
                console.log('summary', this.journalEntrySummary);
                this.prepareChartData();
            });
    }

    private prepareChartData(): void {
        console.log('summarySelector', this.summarySelector?.value);
        this.chartData = {
            chart: {
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'line',
                toolbar: {
                    show: false,
                },
                zoom: {
                    enabled: false,
                },
            },
            colors: ['#166534', '#991b1b'],
            dataLabels: {
                enabled: true,
                enabledOnSeries: [0, 1],
                background: {
                    borderWidth: 0,
                },
            },
            grid: {
                borderColor: 'var(--fuse-border)',
            },
            labels: this.journalEntrySummary[this.summarySelector?.value]?.data.map(x => x.label),
            legend: {
                show: false,
            },
            plotOptions: {
                bar: {
                    columnWidth: '50%',
                },
            },
            series: [
                {
                    name: 'income',
                    type: 'column',
                    data: this.journalEntrySummary[this.summarySelector?.value]?.data.map(x => x.income),
                },
                {
                    name: 'expense',
                    type: 'column',
                    data: this.journalEntrySummary[this.summarySelector?.value]?.data.map(x => Math.abs(x.expense)),
                },
                {
                    name: 'balance',
                    type: 'line',
                    data: this.journalEntrySummary[this.summarySelector?.value]?.data.map(x => x.balance),
                },
            ],
            states: {
                hover: {
                    filter: {
                        type: 'darken',
                        value: 0.85,
                    },
                },
            },
            stroke: {
                width: [3, 0],
            },
            tooltip: {
                followCursor: true,
                theme: 'dark',
            },
            xaxis: {
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    color: 'var(--fuse-border)',
                },
                labels: {
                    style: {
                        colors: 'var(--fuse-text-secondary)',
                    },
                },
                tooltip: {
                    enabled: false,
                },
            },
            yaxis: {
                labels: {
                    offsetX: -16,
                    style: {
                        colors: 'var(--fuse-text-secondary)',
                    },
                },
            },
        };
        console.log('chartData', this.chartData);
    }
}
