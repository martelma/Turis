import { MatRippleModule } from '@angular/material/core';
import { DatePipe, JsonPipe, NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuseScrollResetDirective } from '@fuse/directives/scroll-reset';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { fuseAnimations } from '@fuse/animations';
import { SpinnerButtonComponent } from 'app/shared/components/ui/spinner-button/spinner-button.component';
import { Contact } from '../contact.types';
import { ContactComponent } from '../contact.component';
import { ContactService } from '../contact.service';
import { Observable, tap } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { BookmarkService } from 'app/modules/bookmark/bookmark.service';
import { ContactViewComponent } from '../contact-view/contact-view.component';
import { ContactEditComponent } from '../contact-edit/contact-edit.component';
import { SafeUrl } from '@angular/platform-browser';
import { ImageCropperComponent } from 'app/shared/components/image-cropper/image-cropper.component';
import { MatDialog } from '@angular/material/dialog';
import { dataURItoBlob } from 'app/shared';
import { getSuccessModal } from 'app/shared/types/confirm-modal.types';
import { FuseCardComponent } from '@fuse/components/card';
import { TextFieldModule } from '@angular/cdk/text-field';
import { TagSummaryComponent } from 'app/shared/components/tag-summary/tag-summary.component';

@UntilDestroy()
@Component({
    selector: 'app-contact-details',
    templateUrl: './contact-details.component.html',
    styleUrls: ['./contact-details.component.scss'],
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
        ContactViewComponent,
        ContactEditComponent,
        SpinnerButtonComponent,
        FuseCardComponent,
        TextFieldModule,
        TagSummaryComponent,
    ],
})
export class ContactDetailsComponent implements OnInit {
    @ViewChild(ContactViewComponent) viewContact: ContactViewComponent;
    @ViewChild(ContactEditComponent) editContact: ContactEditComponent;

    editMode = false;
    isCreate = false;
    isCopy = false;
    isDownloading = false;
    downloadingData = false;
    validating = false;

    contact: Contact;

    avatarUrl: SafeUrl;
    contactAvatar: any;

    //queste devono diventare scope
    userCanDeleteContact = true;
    userCanUpdateContact = true;
    userCanValidateContact = true;
    userCanDownloadData = true;
    userCanViewContactStatistics = true;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _contactService: ContactService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _translocoService: TranslocoService,
        private _bookmarkService: BookmarkService,
        private _matDialog: MatDialog,
        public snackBar: MatSnackBar,

        public contactComponent: ContactComponent,
    ) {}

    ngOnInit(): void {
        this._subscribeRouteParams();

        this._subscribeContact();
        this._subscribeContactEdited();
    }

    private _subscribeRouteParams() {
        // console.log('_subscribeRouteParams');
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

    private _subscribeContact() {
        this._contactService.contact$
            .pipe(
                tap((contact: Contact) => {
                    this.setContact(contact);
                }),
                untilDestroyed(this),
            )
            .subscribe((contact: Contact) => {
                this.contact = contact;

                this.editMode = contact?.id === undefined;
            });
    }

    private setContact(contact: Contact): void {
        this.contact = contact;

        // Sets the avatar
        this.avatarUrl = this.contact.avatarUrl;
    }

    private _subscribeContactEdited(): void {
        this._contactService.contactEdited$.pipe(untilDestroyed(this)).subscribe((contactId: string) => {
            if (contactId != null) {
                this._contactService
                    .getById(contactId)
                    .pipe(untilDestroyed(this))
                    .subscribe(() => {
                        this.editMode = true;
                    });
            } else {
                this.editMode = this.contact.id === undefined;
            }
        });
    }

    edit(): void {
        this._contactService.editContact(this.contact.id);
    }

    cancel(): void {
        this._contactService.editContact(null);

        if (this.contact?.id === undefined) {
            this._router.navigate(['../'], { relativeTo: this._activatedRoute });
        }
    }

    save(): void {
        // if (this.isCopy) {
        //     newValue.id = emptyGuid;
        // }

        this._contactService
            .update(this.contact)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                this._refresh();
            });
    }

    private _refresh(): void {
        this.snackBar.open(
            this._translocoService.translate('Messages.ChangesSuccessfullySaved'),
            this._translocoService.translate('General.Dismiss'),
            {
                panelClass: ['success'],
            },
        );

        // Refresh the contact information
        if (this.contact?.id) {
            this._contactService.getById(this.contact?.id).pipe(untilDestroyed(this)).subscribe();
        }

        // Refresh the list of contact
        this._contactService
            .listEntities()
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                if (this.isCreate) {
                    this._router.navigate(['../'], { relativeTo: this._activatedRoute });
                }
            });
    }

    handleBookmark(contact: Contact): void {
        if (contact.bookmarkId) {
            this._bookmarkService
                .delete(contact.bookmarkId)
                .pipe(untilDestroyed(this))
                .subscribe(() => {
                    // Refresh the selected contact
                    this._contactService.getById(contact.id).pipe(untilDestroyed(this)).subscribe();
                });
        } else {
            this._bookmarkService
                .create({
                    entityName: 'Contact',
                    entityId: contact.id,
                })
                .pipe(untilDestroyed(this))
                .subscribe(() => {
                    // Refresh the selected contact
                    this._contactService.getById(contact.id).pipe(untilDestroyed(this)).subscribe();
                });
        }
    }

    onFileChange(event: any) {
        const files = event.target.files as FileList;

        if (files.length > 0) {
            const _fileName = files[0].name;
            const _file = URL.createObjectURL(files[0]);
            this.openAvatarEditor(_file)
                .pipe(
                    tap(result => {
                        // No avatar selected
                        if (!result) {
                            return;
                        }

                        this.contactAvatar = {
                            file: result,
                            fileName: _fileName,
                        };
                        this.avatarUrl = result;

                        this.saveAvatar();
                    }),
                    untilDestroyed(this),
                )
                .subscribe();
        }
    }

    openAvatarEditor(image: string): Observable<string> {
        const dialogRef = this._matDialog.open(ImageCropperComponent, {
            maxWidth: '80vw',
            maxHeight: '80vh',
            data: image,
        });

        return dialogRef.afterClosed();
    }

    saveAvatar = (): void => {
        if (!this.contactAvatar) return;

        const formData = new FormData();
        formData.append('file', dataURItoBlob(this.contactAvatar?.file), this.contactAvatar?.fileName);

        this._contactService
            .saveAvatar(formData, this.contact?.id)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                this._fuseConfirmationService.open(getSuccessModal());

                // this._userService.me().pipe(untilDestroyed(this)).subscribe();
            });
    };

    removePreviewAvatar(): void {
        this.avatarUrl = null;
        this.contactAvatar = null;
    }

    removeAvatar(): void {
        this._contactService
            .resetAvatar(this.contact?.id)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                this._fuseConfirmationService.open(getSuccessModal());

                // this._userService.me().pipe(untilDestroyed(this)).subscribe();
            });
    }

    isDownloadDataButtonDisabled(): boolean {
        return false;
    }

    menuItem1(contact: Contact) {
        console.log('menuItem1', contact);
    }

    menuItem2(contact: Contact) {
        console.log('menuItem2', contact);
    }
}
