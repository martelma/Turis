import { CommonModule } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MaterialModule } from 'app/modules/material.module';
import { User } from 'app/core/user/user.types';
import { ServiceSummary } from '../dashboard.types';
import { ServiceService } from 'app/modules/service/service.service';
import { HoverDirective } from 'app/shared/components/directives/hover-directive';
import {
    ApexAxisChartSeries,
    ApexChart,
    ApexDataLabels,
    ApexGrid,
    ApexPlotOptions,
    ApexResponsive,
    ApexStroke,
    ApexTitleSubtitle,
    ApexTooltip,
    ApexXAxis,
    ApexYAxis,
    ChartComponent,
    NgApexchartsModule,
} from 'ng-apexcharts';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { AppSettings } from 'app/constants';
import { UserSettingsService } from 'app/shared/services/user-setting.service';

export type ChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    stroke: ApexStroke;
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
    yaxis: ApexYAxis;
    tooltip: ApexTooltip;
    colors: string[];
    title: ApexTitleSubtitle;
    subtitle: ApexTitleSubtitle;
    responsive: ApexResponsive[];
    grid: ApexGrid;
    labels: any;
};

@UntilDestroy()
@Component({
    selector: 'app-service-summary',
    standalone: true,
    templateUrl: './service-summary.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [NgApexchartsModule, CommonModule, FormsModule, MaterialModule, TranslocoModule, HoverDirective],
})
export class ServiceSummaryComponent implements OnInit, AfterViewInit {
    @Output() dillDownOn = new EventEmitter<string>();

    years: number[] = [];
    year: number;

    public user: User;
    public isScreenSmall: boolean;

    serviceSummary: ServiceSummary = new ServiceSummary();

    @ViewChild('chart1') chart1: ChartComponent;
    @ViewChild('chart2') chart2: ChartComponent;
    @ViewChild('chart3') chart3: ChartComponent;
    @ViewChild('chart4') chart4: ChartComponent;
    @ViewChild('chart5') chart5: ChartComponent;
    public chart1Options: any;
    public chart2Options: any;
    public chart3Options: any;
    public chart4Options: any;
    public chart5Options: any;

    constructor(
        private _serviceService: ServiceService,
        private _userSettingsService: UserSettingsService,
        private _changeDetectorRef: ChangeDetectorRef,
    ) {
        const currentYear = new Date().getFullYear();
        this.year = currentYear;
        this.years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    }

    ngOnInit(): void {
        this._serviceService.serviceSummary$.pipe(untilDestroyed(this)).subscribe((data: ServiceSummary) => {
            this.serviceSummary = data;
        });
    }

    async ngAfterViewInit(): Promise<void> {
        this.year = await this._userSettingsService.getNumberValue(
            `${AppSettings.HomePage}:service-summary-current-year`,
        );

        this.loadData();
    }

    loadData(): void {
        this._serviceService
            .summary(this.year)
            .pipe(untilDestroyed(this))
            .subscribe(items => {
                this.serviceSummary = items;

                this.prepareCharts();
            });
    }

    onYearChange(event: MatButtonToggleChange): void {
        this.year = event.value;
        this._userSettingsService.setNumberValue(`${AppSettings.HomePage}:service-summary-current-year`, this.year);
        this.loadData();
    }

    show(type: string) {
        console.log('show', type);
        this.dillDownOn.emit(type);
    }

    prepareCharts(): any {
        console.log('serviceSummary', this.serviceSummary);

        //fai attenzione: il sort è decrescene: b.year - a.year
        const years = this.serviceSummary.annualStats.sort((a, b) => b.year - a.year).map(x => x.year) ?? [];
        const totals = this.serviceSummary.annualStats.sort((a, b) => b.year - a.year).map(x => x.total) ?? [];

        this.chart1Options = {
            series: [
                {
                    data: totals,
                },
            ],
            chart: {
                type: 'bar',
                height: 380,
            },
            plotOptions: {
                bar: {
                    barHeight: '100%',
                    distributed: true,
                    horizontal: true,
                    dataLabels: {
                        position: 'bottom',
                    },
                },
            },
            colors: [
                '#33b2df',
                '#546E7A',
                '#d4526e',
                '#13d8aa',
                '#A5978B',
                '#2b908f',
                '#f9a3a4',
                '#90ee7e',
                '#f48024',
                '#69d2e7',
            ],
            dataLabels: {
                enabled: true,
                textAnchor: 'start',
                style: {
                    colors: ['#fff'],
                },
                formatter: function (val, opt) {
                    return opt.w.globals.labels[opt.dataPointIndex] + ':  ' + val;
                },
                offsetX: 0,
                dropShadow: {
                    enabled: true,
                },
            },
            stroke: {
                width: 1,
                colors: ['#fff'],
            },
            xaxis: {
                categories: years,
            },
            yaxis: {
                labels: {
                    show: false,
                },
            },
            title: {
                text: 'Totali per anno',
                align: 'center',
                floating: true,
            },
            // subtitle: {
            //     text: 'Category Names as DataLabels inside bars',
            //     align: 'center',
            // },
            tooltip: {
                theme: 'dark',
                x: {
                    show: false,
                },
                y: {
                    title: {
                        formatter: function () {
                            return '';
                        },
                    },
                },
            },
        };

        const tagNames = this.serviceSummary.tagStats.map(x => x.tagName);
        const tagCounts = this.serviceSummary.tagStats.map(x => x.count);

        this.chart2Options = {
            series: tagCounts,
            chart: {
                width: '100%',
                type: 'pie',
            },
            labels: tagNames,
            title: {
                text: 'Tags anno corrente',
                align: 'center',
                floating: true,
                margin: 40,
            },
            // subtitle: {
            //     text: 'Category Names as DataLabels inside bars',
            //     align: 'center',
            // },
            legend: {
                position: 'bottom',
                horizontalAlign: 'center',
            },
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        chart: {
                            width: '100%',
                        },
                        legend: {
                            position: 'bottom',
                            horizontalAlign: 'center',
                        },
                    },
                },
            ],
        };

        const languageCodes = this.serviceSummary.languageStats.map(x => x.languageCode);
        const languageCounts = this.serviceSummary.languageStats.map(x => x.count);

        this.chart3Options = {
            series: languageCounts,
            chart: {
                width: '100%',
                type: 'pie',
            },
            labels: languageCodes,
            title: {
                text: 'Lingue anno corrente',
                align: 'center',
                floating: true,
                margin: 40,
            },
            // subtitle: {
            //     text: 'Category Names as DataLabels inside bars',
            //     align: 'center',
            // },
            legend: {
                position: 'bottom',
                horizontalAlign: 'center',
            },
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        chart: {
                            width: '100%',
                        },
                        legend: {
                            position: 'bottom',
                            horizontalAlign: 'center',
                        },
                    },
                },
            ],
        };

        const series4 = this.serviceSummary.typeStats.filter(x => x.serviceType === 'Guida').map(x => x.count);
        const labels4 = this.serviceSummary.typeStats.filter(x => x.serviceType === 'Guida').map(x => x.durationType);

        this.chart4Options = {
            series: series4,
            chart: {
                width: '100%',
                type: 'donut',
                sparkline: {
                    enabled: false,
                },
            },
            labels: labels4,
            title: {
                text: 'Guide',
                align: 'center',
                floating: true,
                margin: 30,
            },
            plotOptions: {
                pie: {
                    startAngle: -90,
                    endAngle: 90,
                    offsetY: 10,
                },
            },
            grid: {
                padding: {
                    bottom: -80,
                },
            },
            legend: {
                position: 'bottom',
                horizontalAlign: 'center',
                floating: false, // importante
                fontSize: '14px',
                // markers: {
                //     width: 12,
                //     height: 12,
                // },
                // offsetY: 10,
            },
            // responsive: [
            //     {
            //         breakpoint: 480,
            //         options: {
            //             chart: {
            //                 width: '90%',
            //             },
            //             legend: {
            //                 position: 'bottom',
            //                 horizontalAlign: 'center',
            //             },
            //         },
            //     },
            // ],
        };

        const series5 = this.serviceSummary.typeStats
            .filter(x => x.serviceType === 'Accompagnamento')
            .map(x => x.count);
        const labels5 = this.serviceSummary.typeStats
            .filter(x => x.serviceType === 'Accompagnamento')
            .map(x => x.durationType);

        this.chart5Options = {
            series: series5,
            chart: {
                width: '100%',
                type: 'donut',
            },
            labels: labels5,
            title: {
                text: 'Accompagnamento',
                align: 'center',
                floating: true,
                margin: 30,
            },
            plotOptions: {
                pie: {
                    startAngle: -90,
                    endAngle: 90,
                    offsetY: 10,
                },
            },
            grid: {
                padding: {
                    bottom: -80,
                },
            },
            legend: {
                position: 'bottom',
                horizontalAlign: 'center',
                floating: false, // importante
                fontSize: '14px',
                // markers: {
                //     width: 12,
                //     height: 12,
                // },
                // offsetY: 10,
            },
            // responsive: [
            //     {
            //         breakpoint: 480,
            //         options: {
            //             chart: {
            //                 width: '90%',
            //             },
            //             legend: {
            //                 position: 'bottom',
            //                 horizontalAlign: 'center',
            //             },
            //         },
            //     },
            // ],
        };
    }
}
