import { CommonModule, DatePipe, NgClass, NgIf } from '@angular/common';
import { Component, OnInit, ViewEncapsulation, ViewChild, Input, AfterViewInit } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { User } from 'app/core/user/user.types';
import { Router } from '@angular/router';
import { CommissionStat, TeamSummary } from '../dashboard.types';
import { ContactService } from 'app/modules/contact/contact.service';
import { log, years } from 'app/shared/shared.utils';
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
import { UserSettingsService } from 'app/shared/services/user-setting.service';
import { AppSettings } from 'app/constants';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { MaterialModule } from 'app/modules/material.module';
import { debounceTime, map, Observable, startWith } from 'rxjs';
import { BaseSearchParameters } from 'app/shared/types/shared.types';
import { PaginatedSearchParameters } from 'app/shared/services/shared.types';
import { CollaboratorSearchParameters } from 'app/modules/collaborator/collaborator.types';

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
        FormsModule,
        NgApexchartsModule,
        DatePipe,
        CommonModule,
        MatIconModule,
        MatProgressBarModule,
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
        ReactiveFormsModule,
        MaterialModule,
        MatBadgeModule,
        MatCheckboxModule,
        FuseDrawerComponent,
    ],
})
export class TeamSummaryComponent implements OnInit, AfterViewInit {
    @Input() debounce = 300;
    @Input() minLength = 2;

    years: number[] = [];
    currentYear: number;
    year: number;
    viewMode = 'total';
    searchFilter: string;

    public user: User;
    public isScreenSmall: boolean;

    collaboratorControl = new FormControl('');
    collaborators: Collaborator[] = [];

    teamSummary: TeamSummary;

    log = log;

    @ViewChild('chart') chart: ChartComponent;

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

    searchInputControl: UntypedFormControl = new UntypedFormControl();

    get queryParameters(): CollaboratorSearchParameters {
        return {
            pattern: this.searchInputControl.value,
            pageIndex: 1,
            pageSize: 100,
            orderBy: null,
        };
    }

    constructor(
        private _contactService: ContactService,
        private _sanitizer: DomSanitizer,
        private _userSettingsService: UserSettingsService,
        private router: Router,
    ) {}

    ngOnInit(): void {
        this.currentYear = new Date().getFullYear();
        this.year = this.currentYear;
        this.years = years(5);

        this._subscribeSearchInputControlValueChanges();

        this._contactService.collaboratorsWithMonitor(this.queryParameters).subscribe(items => {
            this.collaborators = items;
        });

        this._contactService.teamSummary$.pipe(untilDestroyed(this)).subscribe((data: TeamSummary) => {
            this.teamSummary = data;
        });
    }

    async ngAfterViewInit(): Promise<void> {
        this.year = await this._userSettingsService.getNumberValue(
            `${AppSettings.HomePage}:team-summary-current-year`,
            this.currentYear,
        );

        setTimeout(async () => {
            this.viewMode = await this._userSettingsService.getStringValue(
                `${AppSettings.HomePage}:team-summary-view-mode`,
                'total',
            );
        }, 0);

        this.loadData();
    }

    private _subscribeSearchInputControlValueChanges(): void {
        this.searchInputControl.valueChanges
            .pipe(
                debounceTime(this.debounce),
                map(value => value),
                untilDestroyed(this),
            )
            .subscribe(value => {
                this.queryParameters.pattern = this.searchInputControl.value;
                this._contactService
                    .collaboratorsWithMonitor(this.queryParameters)
                    .pipe(untilDestroyed(this))
                    .subscribe(items => {
                        this.collaborators = items;
                        console.log('collaborators', this.collaborators);

                        this.loadData();
                    });
            });
    }

    loadData(): void {
        this._contactService
            .teamSummary(this.year, this.queryParameters.pattern)
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

    onYearChange(event: MatButtonToggleChange): void {
        this.year = event.value;
        this._userSettingsService.setNumberValue(`${AppSettings.HomePage}:team-summary-current-year`, this.year);
        this.loadData();
    }

    onViewModeChange(event: MatButtonToggleChange): void {
        this.viewMode = event.value;
        this._userSettingsService.setValue(`${AppSettings.HomePage}:team-summary-view-mode`, this.viewMode);
        this.changeViewMode();
    }

    onSortChange(event: any): void {
        console.log('onSortChange', event.value);

        this.teamSummary.members.sort((a, b) => {
            if (event.value === 'Contact') {
                return a.collaborator.fullName.localeCompare(b.collaborator.fullName);
            } else if (event.value === 'Commission Asc') {
                return b.commission - a.commission;
            } else if (event.value === 'Commission Desc') {
                return a.total - b.total;
            } else if (event.value === 'Percentage Asc') {
                return b.percentage - a.percentage;
            } else if (event.value === 'Percentage Desc') {
                return a.percentage - b.percentage;
            } else {
                return 0;
            }
        });
    }

    onInputChange(event: any): void {
        console.log('onInputChange', event.value);
        this.searchFilter = event;
        console.log('onInputChange', this.searchFilter);
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
