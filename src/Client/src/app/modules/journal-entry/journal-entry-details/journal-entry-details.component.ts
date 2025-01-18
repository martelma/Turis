import { MatRippleModule } from '@angular/material/core';
import { CommonModule, DatePipe, JsonPipe, NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuseScrollResetDirective } from '@fuse/directives/scroll-reset';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { fuseAnimations } from '@fuse/animations';
import { SpinnerButtonComponent } from 'app/shared/components/ui/spinner-button/spinner-button.component';
import { tap } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { BookmarkService } from 'app/modules/bookmark/bookmark.service';
import { JournalEntryComponent } from '../journal-entry.component';
import { trackByFn } from 'app/shared';
import { JournalEntry } from '../journal-entry.types';
import { JournalEntryViewComponent } from '../journal-entry-view/journal-entry-view.component';
import { JournalEntryService } from '../journal-entry.service';

@UntilDestroy()
@Component({
    selector: 'app-journal-entry-details',
    templateUrl: './journal-entry-details.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        NgStyle,
        DatePipe,
        JsonPipe,
        RouterLink,
        CommonModule,
        MatButtonModule,
        MatCheckboxModule,
        MatRippleModule,
        MatIconModule,
        MatMenuModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        FuseScrollResetDirective,
        TranslocoModule,
        SpinnerButtonComponent,
        JournalEntryViewComponent,
    ],
})
export class JournalEntryDetailsComponent implements OnInit {
    editMode = false;
    isCreate = false;
    isCopy = false;
    isDownloading = false;
    downloadingData = false;
    validating = false;

    journalEntry: JournalEntry;

    //queste devono diventare scope
    userCanDeleteJournalEntry = true;
    userCanUpdateJournalEntry = true;
    userCanValidateJournalEntry = true;
    userCanDownloadData = true;
    userCanViewJournalEntriestatistics = true;

    trackByFn = trackByFn;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _translocoService: TranslocoService,
        private _bookmarkService: BookmarkService,
        private _journalEntryService: JournalEntryService,
        public snackBar: MatSnackBar,

        public journalEntriesComponent: JournalEntryComponent,
    ) {}

    ngOnInit(): void {
        this._subscribeRouteParams();
        this._subscribeJournalEntry();
        this._subscribeJournalEntryEdited();
    }

    private _subscribeJournalEntry() {
        this._journalEntryService.journalEntry$.pipe(untilDestroyed(this)).subscribe((journalEntry: JournalEntry) => {
            this.journalEntry = journalEntry;

            console.log('_subscribeJournalEntry - journalEntries', this.journalEntry);

            this.editMode = journalEntry?.id === undefined;
        });
    }

    private _subscribeJournalEntryEdited(): void {
        this._journalEntryService.journalEntryEdited$
            .pipe(untilDestroyed(this))
            .subscribe((journalEntriesId: string) => {
                if (journalEntriesId != null) {
                    this._journalEntryService
                        .getById(journalEntriesId)
                        .pipe(untilDestroyed(this))
                        .subscribe(() => {
                            this.editMode = true;
                        });
                } else {
                    this.editMode = this.journalEntry.id === undefined;
                }
            });
    }

    private _subscribeRouteParams() {
        this._activatedRoute.params
            .pipe(
                tap(params => {
                    // Activates the create user mode
                    this.isCreate = params.id === 'new';
                }),
                untilDestroyed(this),
            )
            .subscribe();
    }

    // save(): void {
    //     this._journalEntriesService
    //         .update(this.journalEntries)
    //         .pipe(untilDestroyed(this))
    //         .subscribe(() => {
    //             this._refresh();

    //             // this._journalEntriesService.editService(null);
    //         });
    // }

    private _refresh(): void {
        this.snackBar.open(
            this._translocoService.translate('Messages.ChangesSuccessfullySaved'),
            this._translocoService.translate('General.Dismiss'),
            {
                panelClass: ['success'],
            },
        );

        // Refresh the service information
        if (this.journalEntry?.id) {
            this._journalEntryService.getById(this.journalEntry?.id).pipe(untilDestroyed(this)).subscribe();
        }

        // Refresh the list of service
        this._journalEntryService
            .listEntities()
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                if (this.isCreate) {
                    this._router.navigate(['../'], { relativeTo: this._activatedRoute });
                }
            });
    }

    handleBookmark(journalEntries: JournalEntry): void {
        if (journalEntries.bookmarkId) {
            this._bookmarkService
                .delete(journalEntries.bookmarkId)
                .pipe(untilDestroyed(this))
                .subscribe(() => {
                    // Refresh the selected service
                    this._journalEntryService.getById(journalEntries.id).pipe(untilDestroyed(this)).subscribe();
                });
        } else {
            this._bookmarkService
                .create({
                    entityName: 'JournalEntry',
                    entityId: journalEntries.id,
                })
                .pipe(untilDestroyed(this))
                .subscribe(() => {
                    // Refresh the selected service
                    this._journalEntryService.getById(journalEntries.id).pipe(untilDestroyed(this)).subscribe();
                });
        }
    }

    edit(): void {
        this._journalEntryService.editJournalEntry(this.journalEntry.id);
    }

    cancel(): void {
        this._journalEntryService.editJournalEntry(null);

        if (this.journalEntry?.id === undefined) {
            this._router.navigate(['../'], { relativeTo: this._activatedRoute });
        }
    }
}
