import { CommonModule, CurrencyPipe, NgClass } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MaterialModule } from 'app/modules/material.module';
import { User } from 'app/core/user/user.types';
import { ActivatedRoute, Router } from '@angular/router';
import { JournalEntryService } from 'app/modules/journal-entry/journal-entry.service';
import { JournalEntrySummary, SummaryData } from '../dashboard.types';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { MatButtonToggleChange, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { UserSettingsService } from 'app/shared/services/user-setting.service';
import { AppSettings } from 'app/constants';

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

    years: number[] = [];
    period: string;

    journalEntrySummary: SummaryData = new SummaryData();

    chartData: ApexOptions = {};

    @ViewChild('summarySelector') summarySelector: MatButtonToggleGroup;

    constructor(
        private _userSettingsService: UserSettingsService,
        private _journalEntryService: JournalEntryService,
    ) {
        const currentYear = new Date().getFullYear();
        this.period = `'year_${currentYear}`;
        this.years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    }

    ngOnInit(): void {
        // this.loadData();
    }

    async ngAfterViewInit() {
        this.period = await this._userSettingsService.getValue(
            `${AppSettings.HomePage}:journal-entry-summary-current-period`,
        );
        this.changePeriod();
    }

    onToggleChange(event: MatButtonToggleChange): void {
        this.period = event.value;
        this._userSettingsService.setValue(`${AppSettings.HomePage}:journal-entry-summary-current-period`, this.period);

        this.changePeriod();
    }

    changePeriod(): void {
        if (this.period.startsWith('year_')) {
            const year = parseInt(this.period.split('_')[1]);
            this.loadYearData(year);
        } else if (this.period === 'monthData') {
            // console.log('Selected month');
            this.loadPeriodData(this.period);
        } else if (this.period === 'weekData') {
            // console.log('Selected week');
            this.loadPeriodData(this.period);
        }
    }

    loadYearData(year: number): void {
        this._journalEntryService
            .yearSummary(year)
            .pipe(untilDestroyed(this))
            .subscribe(items => {
                this.journalEntrySummary = items;

                this.prepareChartData();
            });
    }

    loadPeriodData(period: string): void {
        // console.log('loadData');
        this._journalEntryService
            .periodSummary(period)
            .pipe(untilDestroyed(this))
            .subscribe(items => {
                this.journalEntrySummary = items;

                this.prepareChartData();
            });
    }

    private prepareChartData(): void {
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
            labels: this.journalEntrySummary.data.map(x => x.label),
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
                    data: this.journalEntrySummary.data.map(x => x.income),
                },
                {
                    name: 'expense',
                    type: 'column',
                    data: this.journalEntrySummary.data.map(x => Math.abs(x.expense)),
                },
                {
                    name: 'balance',
                    type: 'line',
                    data: this.journalEntrySummary.data.map(x => x.balance),
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
        // console.log('chartData', this.chartData);
    }
}
