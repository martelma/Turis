import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import {
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    JsonPipe,
    NgClass,
    NgFor,
    NgIf,
    NgStyle,
    NgTemplateOutlet,
} from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { FuseScrollResetDirective } from '@fuse/directives/scroll-reset';
import { TranslocoModule } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { fuseAnimations } from '@fuse/animations';
import { SpinnerButtonComponent } from 'app/shared/components/ui/spinner-button/spinner-button.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ContactViewComponent } from '../contact-view/contact-view.component';
import { ContactEditComponent } from '../contact-edit/contact-edit.component';
import { FuseCardComponent } from '@fuse/components/card';
import { TextFieldModule } from '@angular/cdk/text-field';
import { ServiceService } from 'app/modules/service/service.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import {
    AppSettings,
    getBillingStatusColorClass,
    getCommissionStatusColorClass,
    getStatusColorClass,
} from 'app/constants';
import { ContactSummary, ContactSummaryData } from 'app/modules/admin/dashboard/dashboard.types';
import { MatButtonToggleChange, MatButtonToggleGroup, MatButtonToggleModule } from '@angular/material/button-toggle';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { years } from 'app/shared/shared.utils';
import { UserSettingsService } from 'app/shared/services/user-setting.service';

@UntilDestroy()
@Component({
    selector: 'app-collaborator-summary',
    templateUrl: './collaborator-summary.component.html',
    styleUrls: ['./collaborator-summary.component.scss'],
    styles: [
        `
            .list-grid {
                grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
            }
        `,
    ],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        NgStyle,
        DatePipe,
        DecimalPipe,
        CurrencyPipe,
        JsonPipe,
        RouterLink,
        NgApexchartsModule,
        NgTemplateOutlet,
        MatProgressBarModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatMenuModule,
        MatSortModule,
        MatTooltipModule,
        MatPaginatorModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatOptionModule,
        MatCheckboxModule,
        MatRippleModule,
        MatButtonToggleModule,
        TextFieldModule,
        TranslocoModule,
        ContactViewComponent,
        ContactEditComponent,
        SpinnerButtonComponent,
        FuseScrollResetDirective,
        FuseCardComponent,
    ],
})
export class CollaboratorSummaryComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
    _contactId: string;
    year: number;
    years: number[];

    @Input()
    set contactId(val: string) {
        setTimeout(() => {
            this._contactId = val;
            this.loadData();
        });
    }
    get contactId(): string {
        return this._contactId;
    }

    itemsLoading = false;
    data: ContactSummary;
    currentData: ContactSummaryData;
    chartData: ApexOptions = {};

    getStatusColorClass = getStatusColorClass;
    getBillingStatusColorClass = getBillingStatusColorClass;
    getCommissionStatusColorClass = getCommissionStatusColorClass;

    @ViewChild('summarySelector') summarySelector: MatButtonToggleGroup;

    constructor(
        private _serviceService: ServiceService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _userSettingsService: UserSettingsService,
        public snackBar: MatSnackBar,
    ) {}

    ngOnInit(): void {
        this.years = years(5);

        this._serviceService.contactSummary$.pipe(untilDestroyed(this)).subscribe((data: ContactSummary) => {
            this.data = data;

            this._changeDetectorRef.detectChanges();

            // if (!this.summarySelector?.value) {
            //     this.summarySelector.value = new Date().getFullYear(); // Imposta un valore iniziale selezionato
            // }
        });

        // Services loading
        this._serviceService.loading$.pipe(untilDestroyed(this)).subscribe((servicesLoading: boolean) => {
            this.itemsLoading = servicesLoading;
        });
    }

    async ngAfterViewInit() {
        this.year =
            (await this._userSettingsService.getNumberValue(`${AppSettings.Contact}:stat-year`)) ??
            new Date().getFullYear();

        // console.log('year', this.year);

        // Verifichiamo che summarySelector esista prima di impostarne il valore
        if (this.summarySelector) {
            setTimeout(() => {
                this.summarySelector.value = this.year;
                this._changeDetectorRef.markForCheck();
            });
        }

        this.loadData();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['contactId']) {
            this.contactId = changes['contactId'].currentValue;
        }
    }

    ngOnDestroy(): void {}

    loadData() {
        if (this._contactId && this.year > 0) {
            this._serviceService
                .listContactSummary(this._contactId, this.year)
                .pipe(untilDestroyed(this))
                .subscribe(() => {
                    this.prepareChartData();
                });
        }
    }

    onToggleChange(event: MatButtonToggleChange): void {
        this.year = event.value;
        this._userSettingsService.setNumberValue(`${AppSettings.Contact}:stat-year`, this.year);
        this.summarySelector.value = this.year;
        this.loadData();
    }

    private prepareChartData(): void {
        this.currentData = this.data.years[0];

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
            labels: this.currentData.data.map(x => x.label),
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
                    name: 'total',
                    type: 'column',
                    data: this.currentData.data.map(x => x.value),
                },
                {
                    name: 'payed',
                    type: 'column',
                    data: this.currentData.data.map(x => x.value),
                },
                {
                    name: 'balance',
                    type: 'line',
                    data: this.currentData.data.map(x => x.balance),
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
