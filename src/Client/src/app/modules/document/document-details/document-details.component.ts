import { Document } from './../document.types';
import { MatRippleModule } from '@angular/material/core';
import { CommonModule, DatePipe, JsonPipe, NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, OnInit, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, RouterLink } from '@angular/router';
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
import { DocumentComponent } from '../document.component';
import { DocumentService } from '../document.service';
import { trackByFn } from 'app/shared';
import { DocumentViewComponent } from '../document-view/document-view.component';
import { DocumentNewComponent } from '../document-new/document-new.component';
import { DocumentEditComponent } from '../document-edit/document-edit.component';

@UntilDestroy()
@Component({
    selector: 'app-document-details',
    templateUrl: './document-details.component.html',
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
        DocumentViewComponent,
        DocumentNewComponent,
        DocumentEditComponent,
    ],
})
export class DocumentDetailsComponent implements OnInit, AfterViewInit {
    editMode = false;

    isCreate = false;
    isCopy = false;
    isDownloading = false;
    downloadingData = false;
    validating = false;

    document: Document;

    //queste devono diventare scope
    userCanDeleteDocument = true;
    userCanUpdateDocument = true;
    userCanValidateDocument = true;
    userCanDownloadData = true;
    userCanViewDocumentStatistics = true;

    trackByFn = trackByFn;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _translocoService: TranslocoService,
        private _bookmarkService: BookmarkService,
        private _documentService: DocumentService,
        public snackBar: MatSnackBar,
        public documentComponent: DocumentComponent,
    ) {}

    ngOnInit(): void {
        this._subscribeRouteParams();
        this._subscribeDocument();
        this._subscribeDocumentEdited();
    }

    ngAfterViewInit(): void {
        console.log('document', this.document);
    }

    private _subscribeDocument() {
        this._documentService.item$.pipe(untilDestroyed(this)).subscribe((document: Document) => {
            this.document = document;

            if (document === null) {
                this.isCreate = true;
            } else {
                this.editMode = document?.id === undefined;
            }

            console.log('document', this.document);
            console.log('isCreate', this.isCreate);
            console.log('editMode', this.editMode);
        });
    }

    private _subscribeDocumentEdited(): void {
        this._documentService.edited$.pipe(untilDestroyed(this)).subscribe((documentId: string) => {
            if (documentId != null) {
                this._documentService
                    .getById(documentId)
                    .pipe(untilDestroyed(this))
                    .subscribe(() => {
                        this.editMode = true;
                    });
            } else {
                this.editMode = this.document.id === undefined;
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
    //     this._documentService
    //         .update(this.document)
    //         .pipe(untilDestroyed(this))
    //         .subscribe(() => {
    //             this._refresh();

    //             // this._documentService.editService(null);
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
        if (this.document?.id) {
            this._documentService.getById(this.document?.id).pipe(untilDestroyed(this)).subscribe();
        }

        // Refresh the list of service
        this._documentService
            .listEntities()
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                if (this.isCreate) {
                    this._router.navigate(['../'], { relativeTo: this._activatedRoute });
                }
            });
    }

    handleBookmark(document: Document): void {
        if (document.bookmarkId) {
            this._bookmarkService
                .delete(document.bookmarkId)
                .pipe(untilDestroyed(this))
                .subscribe(() => {
                    // Refresh the selected service
                    this._documentService.getById(document.id).pipe(untilDestroyed(this)).subscribe();
                });
        } else {
            this._bookmarkService
                .create({
                    entityName: 'Document',
                    entityId: document.id,
                })
                .pipe(untilDestroyed(this))
                .subscribe(() => {
                    // Refresh the selected service
                    this._documentService.getById(document.id).pipe(untilDestroyed(this)).subscribe();
                });
        }
    }

    edit(): void {
        this._documentService.editEntity(this.document.id);
    }

    cancel(): void {
        this._documentService.editEntity(null);

        if (this.document?.id === undefined) {
            this._router.navigate(['../'], { relativeTo: this._activatedRoute });
        }
    }
}
