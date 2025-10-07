import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
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
    imports: [CommonModule, FormsModule, MaterialModule, TranslocoModule, NgApexchartsModule],
})
export class TeamSummaryComponent implements OnInit {
    public user: User;
    public isScreenSmall: boolean;

    teamSummary: TeamSummary;

    log = log;

    @ViewChild('chart') chart: ChartComponent;
    public chartOptions: Partial<ChartOptions>;

    constructor(
        private _contactService: ContactService,
        private _sanitizer: DomSanitizer,
        private router: Router,
    ) {}

    ngOnInit(): void {
        this._contactService.teamSummary$.pipe(untilDestroyed(this)).subscribe((data: TeamSummary) => {
            this.teamSummary = data;
        });

        this.loadData();
    }

    loadData(): void {
        this._contactService
            .teamSummary()
            .pipe(untilDestroyed(this))
            .subscribe(data => {
                this.teamSummary = data;
                // console.log('Team summary', this.teamSummary);

                this.teamSummary.members.forEach(item => {
                    item.collaborator.avatarUrl = item.collaborator.avatar
                        ? this._sanitizer.bypassSecurityTrustResourceUrl(
                              `data:image/jpg;base64, ${item.collaborator.avatar}`,
                          )
                        : undefined;

                    item.chartOptions = this.prepareChart(item.collaborator, item.commissionStat);
                });
            });
    }

    prepareChart(collaborator: Collaborator, commissionStat: CommissionStat[]): any {
        // Estrai i valori di commission
        const commissionData = commissionStat.sort((a, b) => a.month - b.month).map(stat => stat.commission);
        const turisData = commissionStat.sort((a, b) => a.month - b.month).map(stat => stat.total);

        const uniqueMonths = commissionStat.filter(
            (item, index, self) => index === self.findIndex(t => t.year === item.year && t.month === item.month),
        );

        const chartOptions = {
            series: [
                {
                    name: collaborator.firstName + ' ' + collaborator.lastName,
                    data: commissionData,
                },
                {
                    name: 'Turis',
                    data: turisData,
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

        return chartOptions;
    }

    openContact(contact: Contact) {
        const url = this.router.serializeUrl(this.router.createUrlTree(['/contact', contact?.id]));
        window.open(url, '_blank');
    }
}
