import { AccountStatementParameters, Service } from 'app/modules/service/service.types';
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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuseScrollResetDirective } from '@fuse/directives/scroll-reset';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { fuseAnimations } from '@fuse/animations';
import { SpinnerButtonComponent } from 'app/shared/components/ui/spinner-button/spinner-button.component';
import { ContactService } from '../contact.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { BookmarkService } from 'app/modules/bookmark/bookmark.service';
import { ContactViewComponent } from '../contact-view/contact-view.component';
import { ContactEditComponent } from '../contact-edit/contact-edit.component';
import { MatDialog } from '@angular/material/dialog';
import { FuseCardComponent } from '@fuse/components/card';
import { TextFieldModule } from '@angular/cdk/text-field';
import { ServiceService } from 'app/modules/service/service.service';
import { PaginatedListResult } from 'app/shared/services/shared.types';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import {
    getBillingStatusColorClass,
    getCommissionStatusColorClass,
    getStatusColorClass,
    ContactTypes,
} from 'app/constants';
import { UntypedFormGroup } from '@angular/forms';
import { ContactSummary, ContactSummaryData } from 'app/modules/admin/dashboard/dashboard.types';
import { MatButtonToggleChange, MatButtonToggleGroup, MatButtonToggleModule } from '@angular/material/button-toggle';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';

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

    @Input()
    set contactId(val: string) {
        setTimeout(() => {
            this._contactId = val;
            // console.log('_contactId', this._contactId);
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
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _contactService: ContactService,
        private _serviceService: ServiceService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _translocoService: TranslocoService,
        private _bookmarkService: BookmarkService,
        private _matDialog: MatDialog,
        private _changeDetectorRef: ChangeDetectorRef,
        public snackBar: MatSnackBar,
    ) {}

    ngOnInit(): void {
        this._serviceService.contactSummary$.pipe(untilDestroyed(this)).subscribe((data: ContactSummary) => {
            this.data = data;
            console.log('data', this.data);

            this._changeDetectorRef.detectChanges();

            if (this.summarySelector?.value) {
                this.summarySelector.value = '2024'; // Imposta un valore iniziale selezionato
            }
        });

        // Services loading
        this._serviceService.loading$.pipe(untilDestroyed(this)).subscribe((servicesLoading: boolean) => {
            this.itemsLoading = servicesLoading;
        });
    }

    ngAfterViewInit() {
        this.loadData();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.contactId = changes.currentValue.currentValue;
    }

    ngOnDestroy(): void {}

    loadData() {
        if (this._contactId) {
            this._serviceService.listContactSummary(this._contactId).pipe(untilDestroyed(this)).subscribe();
        }
    }

    onToggleChange(event: MatButtonToggleChange): void {
        this.summarySelector.value = event.value;
        this.prepareChartData();
    }

    private prepareChartData(): void {
        this.currentData = this.data.years.filter(x => x.label === this.summarySelector?.value)[0];
        console.log('currentData', this.currentData);

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
        console.log('chartData', this.chartData);
    }
}
