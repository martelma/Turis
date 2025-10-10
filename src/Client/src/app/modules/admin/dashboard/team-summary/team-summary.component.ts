import { CommonModule, DatePipe, DecimalPipe, NgClass, NgIf } from '@angular/common';
import { Component, OnInit, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MaterialModule } from 'app/modules/material.module';
import { User } from 'app/core/user/user.types';
import { Router } from '@angular/router';
import { CommissionStat, TeamSummary } from '../dashboard.types';
import { ContactService } from 'app/modules/contact/contact.service';
import { log } from 'app/shared/shared.utils';
import { Contact } from 'app/modules/contact/contact.types';
import { DomSanitizer } from '@angular/platform-browser';

import {
    ChartComponent,
    ApexAxisChartSeries,
    ApexChart,
    ApexXAxis,
    ApexDataLabels,
    ApexTooltip,
    ApexStroke,
    NgApexchartsModule,
} from 'ng-apexcharts';
import { Collaborator } from 'app/modules/service/service.types';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { UploadFilesComponent } from 'app/shared/components/upload-files/upload-files.component';

export type ChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    stroke: ApexStroke;
    tooltip: ApexTooltip;
    dataLabels: ApexDataLabels;
};

@UntilDestroy()
@Component({
    selector: 'app-team-summary',
    standalone: true,
    templateUrl: './team-summary.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        NgIf,
        NgClass,
        NgApexchartsModule,
        DatePipe,
        CommonModule,
        MatIconModule,
        MatProgressBarModule,
        MatButtonModule,
        MatTabsModule,
        MatTableModule,
        MatButtonModule,
        MatMenuModule,
        MatPaginatorModule,
        MatDividerModule,
        MatSortModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        UploadFilesComponent,
        TranslocoModule,
    ],
})
export class TeamSummaryComponent implements OnInit {
    private _year: number;
    @Input()
    get year(): number {
        return this._year;
    }
    set year(value: number) {
        this._year = value;

        this.loadData();
    }

    private _viewMode: string;
    @Input()
    get viewMode(): string {
        return this._viewMode;
    }
    set viewMode(value: string) {
        this._viewMode = value;

        this.changeViewMode();
    }

    public user: User;
    public isScreenSmall: boolean;

    teamSummary: TeamSummary;

    log = log;

    @ViewChild('chart') chart: ChartComponent;
    public chartTotalOptions: Partial<ChartOptions>;

    columnsToDisplay: string[] = [
        'month',
        'amountMin',
        'amountMax',
        'percentageMin',
        'percentageMax',
        'commission',
        'total',
        'percentage',
    ];

    dataSource: any = new MatTableDataSource(null);

    constructor(
        private _contactService: ContactService,
        private _sanitizer: DomSanitizer,
        private router: Router,
    ) {}

    ngOnInit(): void {
        this._contactService.teamSummary$.pipe(untilDestroyed(this)).subscribe((data: TeamSummary) => {
            this.teamSummary = data;
        });
    }

    loadData(): void {
        this._contactService
            .teamSummary(this.year)
            .pipe(untilDestroyed(this))
            .subscribe(data => {
                this.teamSummary = data;

                this.teamSummary.members.forEach(item => {
                    item.collaborator.avatarUrl = item.collaborator.avatar
                        ? this._sanitizer.bypassSecurityTrustResourceUrl(
                              `data:image/jpg;base64, ${item.collaborator.avatar}`,
                          )
                        : undefined;
                });

                this.changeViewMode();
            });
    }

    changeViewMode() {
        if (this.viewMode === 'total') {
            this.teamSummary?.members?.forEach(item => {
                item.chartOptions = this.prepareChartTotal(item.collaborator, item.commissionStat);
            });
        } else if (this.viewMode === 'amount') {
            this.teamSummary?.members?.forEach(item => {
                item.chartOptions = this.prepareChartAmount(item.collaborator, item.commissionStat);
            });
        } else if (this.viewMode === 'percentage') {
            this.teamSummary?.members?.forEach(item => {
                item.chartOptions = this.prepareChartPercentage(item.collaborator, item.commissionStat);
            });
        } else if (this.viewMode === 'data') {
            this.teamSummary?.members?.forEach(item => {
                setTimeout(async () => {
                    item.dataSource = new MatTableDataSource(item.commissionStat);
                }, 0);
            });
        }
    }

    prepareChartTotal(collaborator: Collaborator, commissionStat: CommissionStat[]): any {
        const commissionData = commissionStat.sort((a, b) => a.month - b.month).map(stat => stat.commission);
        const totalData = commissionStat.sort((a, b) => a.month - b.month).map(stat => stat.total);

        const uniqueMonths = commissionStat.filter(
            (item, index, self) => index === self.findIndex(t => t.year === item.year && t.month === item.month),
        );

        const options = {
            series: [
                {
                    name: collaborator.firstName + ' ' + collaborator.lastName,
                    data: commissionData,
                },
                {
                    name: 'Turis',
                    data: totalData,
                },
            ],
            chart: {
                height: 350,
                type: 'area',
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                curve: 'smooth',
            },
            xaxis: {
                type: 'datetime',
                categories: uniqueMonths.map(({ year, month }) => new Date(year, month - 1, 1).toISOString()),
            },
            tooltip: {
                x: {
                    format: 'dd/MM/yy HH:mm',
                },
            },
        };

        return options;
    }

    prepareChartAmount(collaborator: Collaborator, commissionStat: CommissionStat[]): any {
        const amountMinData = commissionStat.sort((a, b) => a.month - b.month).map(stat => stat.amountMin);
        const amountData = commissionStat.sort((a, b) => a.month - b.month).map(stat => stat.commission);
        const amountMaxData = commissionStat.sort((a, b) => a.month - b.month).map(stat => stat.amountMax);
        const totalData = commissionStat.sort((a, b) => a.month - b.month).map(stat => stat.total);

        const uniqueMonths = commissionStat.filter(
            (item, index, self) => index === self.findIndex(t => t.year === item.year && t.month === item.month),
        );

        const options = {
            series: [
                {
                    name: 'AmountMin',
                    type: 'column',
                    data: amountMinData,
                },
                {
                    name: 'Commission',
                    type: 'column',
                    data: amountData,
                },
                {
                    name: 'AmountMax',
                    type: 'column',
                    data: amountMaxData,
                },
                {
                    name: 'Total',
                    type: 'line',
                    data: totalData,
                },
            ],
            chart: {
                height: 350,
                type: 'line',
                stacked: false,
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                width: [1, 1, 4],
            },
            title: {
                text: 'title',
                align: 'left',
                offsetX: 110,
            },
            xaxis: {
                categories: uniqueMonths,
            },
            yaxis: [
                {
                    seriesName: 'AmountMin',
                    axisTicks: {
                        show: true,
                    },
                    axisBorder: {
                        show: true,
                        color: '#008FFB',
                    },
                    labels: {
                        style: {
                            colors: '#008FFB',
                        },
                    },
                    title: {
                        text: 'AmountMin',
                        style: {
                            color: '#008FFB',
                        },
                    },
                    tooltip: {
                        enabled: true,
                    },
                },
                {
                    seriesName: 'Commission',
                    opposite: true,
                    axisTicks: {
                        show: true,
                    },
                    axisBorder: {
                        show: true,
                        color: '#00E396',
                    },
                    labels: {
                        style: {
                            colors: '#00E396',
                        },
                    },
                    title: {
                        text: 'Commission',
                        style: {
                            color: '#00E396',
                        },
                    },
                },
                {
                    seriesName: 'AmountMax',
                    opposite: true,
                    axisTicks: {
                        show: true,
                    },
                    axisBorder: {
                        show: true,
                        color: '#00E396',
                    },
                    labels: {
                        style: {
                            colors: '#00E396',
                        },
                    },
                    title: {
                        text: 'AmountMax',
                        style: {
                            color: '#00E396',
                        },
                    },
                },
                {
                    seriesName: 'Total',
                    opposite: true,
                    axisTicks: {
                        show: true,
                    },
                    axisBorder: {
                        show: true,
                        color: '#FEB019',
                    },
                    labels: {
                        style: {
                            colors: '#FEB019',
                        },
                    },
                    title: {
                        text: 'Total',
                        style: {
                            color: '#FEB019',
                        },
                    },
                },
            ],
            tooltip: {
                fixed: {
                    enabled: true,
                    position: 'topLeft', // topRight, topLeft, bottomRight, bottomLeft
                    offsetY: 30,
                    offsetX: 60,
                },
            },
            legend: {
                horizontalAlign: 'left',
                offsetX: 40,
            },
        };
        return options;
    }

    prepareChartPercentage(collaborator: Collaborator, commissionStat: CommissionStat[]): any {
        const percentageMinData = commissionStat.sort((a, b) => a.month - b.month).map(stat => stat.percentageMin);
        const percentageData = commissionStat.sort((a, b) => a.month - b.month).map(stat => stat.percentage);
        const percentageMaxData = commissionStat.sort((a, b) => a.month - b.month).map(stat => stat.percentageMax);
        const totalData = commissionStat.sort((a, b) => a.month - b.month).map(stat => stat.total);

        const uniqueMonths = commissionStat.filter(
            (item, index, self) => index === self.findIndex(t => t.year === item.year && t.month === item.month),
        );

        const options = {
            series: [
                {
                    name: 'PercentageMin',
                    type: 'column',
                    data: percentageMinData,
                },
                {
                    name: 'Commission',
                    type: 'column',
                    data: percentageData,
                },
                {
                    name: 'PercentageMax',
                    type: 'column',
                    data: percentageMaxData,
                },
                {
                    name: 'Total',
                    type: 'line',
                    data: totalData,
                },
            ],
            chart: {
                height: 350,
                type: 'line',
                stacked: false,
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                width: [1, 1, 4],
            },
            title: {
                text: 'title',
                align: 'left',
                offsetX: 110,
            },
            xaxis: {
                categories: uniqueMonths,
            },
            yaxis: [
                {
                    seriesName: 'PercentageMin',
                    axisTicks: {
                        show: true,
                    },
                    axisBorder: {
                        show: true,
                        color: '#008FFB',
                    },
                    labels: {
                        style: {
                            colors: '#008FFB',
                        },
                    },
                    title: {
                        text: 'PercentageMin',
                        style: {
                            color: '#008FFB',
                        },
                    },
                    tooltip: {
                        enabled: true,
                    },
                },
                {
                    seriesName: 'Percentage',
                    opposite: true,
                    axisTicks: {
                        show: true,
                    },
                    axisBorder: {
                        show: true,
                        color: '#00E396',
                    },
                    labels: {
                        style: {
                            colors: '#00E396',
                        },
                    },
                    title: {
                        text: 'Commission',
                        style: {
                            color: '#00E396',
                        },
                    },
                },
                {
                    seriesName: 'PercentageMax',
                    opposite: true,
                    axisTicks: {
                        show: true,
                    },
                    axisBorder: {
                        show: true,
                        color: '#00E396',
                    },
                    labels: {
                        style: {
                            colors: '#00E396',
                        },
                    },
                    title: {
                        text: 'PercentageMax',
                        style: {
                            color: '#00E396',
                        },
                    },
                },
                {
                    seriesName: 'Total',
                    opposite: true,
                    axisTicks: {
                        show: true,
                    },
                    axisBorder: {
                        show: true,
                        color: '#FEB019',
                    },
                    labels: {
                        style: {
                            colors: '#FEB019',
                        },
                    },
                    title: {
                        text: 'Total',
                        style: {
                            color: '#FEB019',
                        },
                    },
                },
            ],
            tooltip: {
                fixed: {
                    enabled: true,
                    position: 'topLeft', // topRight, topLeft, bottomRight, bottomLeft
                    offsetY: 30,
                    offsetX: 60,
                },
            },
            legend: {
                horizontalAlign: 'left',
                offsetX: 40,
            },
        };
        return options;
    }

    openContact(contact: Contact) {
        const url = this.router.serializeUrl(this.router.createUrlTree(['/contact', contact?.id]));
        window.open(url, '_blank');
    }
}
