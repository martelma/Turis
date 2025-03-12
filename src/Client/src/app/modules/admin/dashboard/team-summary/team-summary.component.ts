import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MaterialModule } from 'app/modules/material.module';
import { User } from 'app/core/user/user.types';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamSummary } from '../dashboard.types';
import { ServiceService } from 'app/modules/service/service.service';
import { ContactService } from 'app/modules/contact/contact.service';

@UntilDestroy()
@Component({
    selector: 'app-team-summary',
    standalone: true,
    templateUrl: './team-summary.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [CommonModule, FormsModule, MaterialModule, TranslocoModule],
})
export class TeamSummaryComponent implements OnInit {
    public user: User;
    public isScreenSmall: boolean;

    teamSummary: TeamSummary;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _contactService: ContactService,
        private _router: Router,
    ) {}

    ngOnInit(): void {
        this._contactService.teamSummary$.pipe(untilDestroyed(this)).subscribe((data: TeamSummary) => {
            this.teamSummary = data;
        });

        this.loadData();
    }

    loadData(): void {
        console.log('Loading data');

        this._contactService
            .teamSummary()
            .pipe(untilDestroyed(this))
            .subscribe(items => {
                this.teamSummary = items;
            });
    }
}
