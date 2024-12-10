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
import { tap } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { BookmarkService } from 'app/modules/bookmark/bookmark.service';
import { ContactViewComponent } from '../contact-view/contact-view.component';
import { ContactEditComponent } from '../contact-edit/contact-edit.component';

@UntilDestroy()
@Component({
    selector: 'app-contact-details',
    templateUrl: './contact-details.component.html',
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
    ],
})
export class ContactDetailsComponent implements OnInit {
    // @ViewChild(ParametersComponent) parameters: ParametersComponent;
    @ViewChild(ContactViewComponent) viewContact: ContactViewComponent;
    @ViewChild(ContactEditComponent) editContact: ContactEditComponent;

    editMode = false;
    isCreate = false;
    isCopy = false;
    isDownloading = false;
    downloadingData = false;
    validating = false;

    contact: Contact;

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
        public snackBar: MatSnackBar,

        public contactComponent: ContactComponent,
    ) {}

    ngOnInit(): void {
        this._subscribeRouteParams();

        this._subscribeSignalR();

        this._subscribeContact();
        this._subscribeContactEdited();
    }

    _subscribeSignalR(): void {
        // this._signalRContact.connect();
        // this._signalRContact.taskCompleted$
        //     .pipe(
        //         filter((obj: TaskCompletedMessage) => !!obj),
        //         filter((obj: TaskCompletedMessage) => obj.adminMessage === false),
        //         filter((obj: TaskCompletedMessage) => obj.correlationKey === 'DownloadData'),
        //         untilDestroyed(this),
        //     )
        //     .subscribe((obj: TaskCompletedMessage) => {
        //         // Opens the notification panel with the most recent completed jobs
        //         BaseCommands.instance.openNotificationsPanel({ selectedJobStatus: 'Completed' });
        //         this.downloadingData = false;
        //         if (obj.status === 'OK') {
        //             // IMPORTANT: SignalR sends two messages
        //             // Avoids multiple file downloads when jobs are completed
        //             if (!this.isDownloading) {
        //                 this.isDownloading = true;
        //                 const fileName = obj.data.data;
        //                 this._downloadContact
        //                     .download(obj.data.jobId, fileName)
        //                     .pipe(untilDestroyed(this))
        //                     .subscribe((response: HttpResponse<Blob>) => {
        //                         this._downloadContact.saveResponseBlob(response, obj.data.data ?? fileName);
        //                     })
        //                     .add(() => {
        //                         this.isDownloading = false;
        //                     });
        //             }
        //         } else if (obj.status === 'KO') {
        //             this.snackBar.open(obj.message, this._translocoService.translate('General.Dismiss'), {
        //                 panelClass: ['error'],
        //             });
        //         }
        //     });
    }

    private _subscribeRouteParams() {
        console.log('_subscribeRouteParams');
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
        this._contactService.contact$.pipe(untilDestroyed(this)).subscribe((contact: Contact) => {
            this.contact = contact;

            this.editMode = contact?.id === undefined;
        });
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

    isDownloadDataButtonDisabled(): boolean {
        return false;
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

    menuItem1(contact: Contact) {
        console.log('menuItem1', contact);
    }

    menuItem2(contact: Contact) {
        console.log('menuItem2', contact);
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

                // this._contactService.editContact(null);
                // this._contactService.copyContact(null);
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

    // handleCheck(contact: Contact): void {
    //     if (contact.checked) {
    //         this._contactService.setCheck(contact);
    //     } else {
    //         this._contactService.setUnCheck(contact);
    //     }
    // }
}
