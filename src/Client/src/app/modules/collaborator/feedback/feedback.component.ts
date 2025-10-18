import { goToLink } from './../../../shared/shared.utils';
import { CommonModule, CurrencyPipe, JsonPipe, NgClass, NgFor, NgIf, NgStyle, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { TranslocoModule } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { SearchInputComponent } from 'app/components/ui/search-input/search-input.component';
import { MaterialModule } from 'app/modules/material.module';
import { FullCalendarModule } from '@fullcalendar/angular';
import { ServiceSidebarComponent } from 'app/modules/service/service-sidebar/service-sidebar.component';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { KeyboardShortcutsModule } from 'ng-keyboard-shortcuts';
import { finalize, tap } from 'rxjs';
import { FeedbackService } from './feedback.service';
import { CheckDataInfo } from '../collaborator.types';
import { ConfirmationDialogService } from 'app/shared/services/confirmation-dialog.service';

declare let $: any;

@UntilDestroy()
@Component({
    selector: 'app-feedback',
    templateUrl: './feedback.component.html',
    styleUrls: ['./feedback.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        KeyboardShortcutsModule,
        NgIf,
        NgFor,
        NgClass,
        NgStyle,
        CurrencyPipe,
        RouterLink,
        FormsModule,
        ReactiveFormsModule,
        MatProgressBarModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatSortModule,
        NgTemplateOutlet,
        MatPaginatorModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatOptionModule,
        MatCheckboxModule,
        MatRippleModule,
        MatTooltipModule,
        TranslocoModule,
        SearchInputComponent,
        JsonPipe,
        SearchInputComponent,
        CommonModule,
        MaterialModule,
        FullCalendarModule,
        FuseDrawerComponent,
        ServiceSidebarComponent,
    ],
})
export class FeedbackComponent implements OnInit, AfterViewInit, OnDestroy {
    id: string;
    loading = false;

    checkDataInfo: CheckDataInfo;

    goToLink = goToLink;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _confirmationDialogService: ConfirmationDialogService,
        private feedbackService: FeedbackService,
    ) {}

    ngOnInit(): void {
        this.id = this._activatedRoute.snapshot.paramMap.get('id');
    }

    ngAfterViewInit(): void {
        this.loadData();
    }

    ngOnDestroy(): void {}

    loadData(): void {
        this.loading = true;
        this.feedbackService
            .checkDataInfo(this.id)
            .pipe(
                finalize(() => {
                    this.loading = false;
                }),
                tap((data: CheckDataInfo) => {
                    this.checkDataInfo = data;
                    console.log('loadData-checkDataInfo', this.checkDataInfo);
                }),
                untilDestroyed(this),
            )
            .subscribe();
    }

    acceptService(serviceId: string): void {
        this._confirmationDialogService
            .showWarningMessage({
                title: 'Are you sure?',
                text: 'Confermi di prendere in carico il Servizio in oggetto?',
                showCancelButton: true,
                confirmButtonText: 'Confirm',
            })
            .then(result => {
                if (result.value) {
                    this.loading = true;

                    this.feedbackService
                        .acceptService(serviceId)
                        .pipe(
                            tap(() => {
                                this.goToLink('/home');
                            }),
                            untilDestroyed(this),
                        )
                        .subscribe({
                            next: () => {},
                            error: error => {
                                this.loading = false;
                                console.error(error);
                            },
                        });
                }
            });
    }
    rejectService(serviceId: string): void {
        this._confirmationDialogService
            .showWarningMessage({
                title: 'Are you sure?',
                text: 'Confermi di rifiutare il Servizio in oggetto?',
                showCancelButton: true,
                confirmButtonText: 'Confirm',
            })
            .then(result => {
                if (result.value) {
                    this.loading = true;

                    this.feedbackService
                        .rejectService(serviceId)
                        .pipe(
                            tap(() => {
                                this.goToLink('/home');
                            }),
                            untilDestroyed(this),
                        )
                        .subscribe({
                            next: () => {},
                            error: error => {
                                this.loading = false;
                                console.error(error);
                            },
                        });
                }
            });
    }
}
