import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { NgIf, NgClass, NgFor, DecimalPipe, DatePipe, CommonModule, NgStyle } from '@angular/common';
import { UploadFilesComponent } from '../upload-files/upload-files.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { detailExpand } from 'app/shared/animations/detail-expand';
import { UserDateFormats } from 'app/constants';
import { Attachment, AttachmentSearchParameters } from './attachment.types';
import { AttachmentService } from './attachment.service';
import { ConfirmationDialogService } from 'app/shared/services/confirmation-dialog.service';
import { PaginatedList } from 'app/shared/types/shared.types';
import { TranslocoModule } from '@ngneat/transloco';

@UntilDestroy()
@Component({
    selector: 'app-attachments',
    templateUrl: './attachments.component.html',
    animations: [detailExpand],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgStyle,
        CommonModule,
        NgClass,
        MatIconModule,
        MatProgressBarModule,
        MatButtonModule,
        MatTabsModule,
        MatTableModule,
        MatButtonModule,
        MatMenuModule,
        MatPaginatorModule,
        MatDividerModule,
        MatSortModule,
        MatTooltipModule,
        DecimalPipe,
        DatePipe,
        UploadFilesComponent,
        TranslocoModule,
    ],
})
export class AttachmentsComponent implements OnInit, OnChanges, OnDestroy {
    @ViewChild('matPaginator') paginator!: MatPaginator;
    @ViewChild('matSort') sort!: MatSort;
    @ViewChild('appUploadFile') appUploadFile: UploadFilesComponent;

    @Input() entityName: string;
    @Input() entityKey: string;
    @Input() folder: string;

    @Output() onListChanged = new EventEmitter<void>();

    loading = false;
    waiting = false;
    uploadMode = false;

    selectedAttachment: any;
    displayedColumns: string[] = ['row', 'originalFileName', 'user', 'timeStamp', 'tools'];
    dataSource: MatTableDataSource<Attachment>;

    attachmentSearchParameters: AttachmentSearchParameters = new AttachmentSearchParameters();
    attachments: Attachment[] = [];

    pageIndex = 0;
    pageSize = 10;
    pageSizeOptions = [10, 15, 20, 30];

    userDateFormats = UserDateFormats;

    constructor(
        private _attachmentService: AttachmentService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _confirmationDialogService: ConfirmationDialogService,
    ) {}

    ngOnInit(): void {}

    ngOnChanges(changes: SimpleChanges): void {
        this.loadAttachments();
    }

    ngOnDestroy(): void {}

    uploadFiles(files: any[]): void {
        this.uploadMode = false;
        this.waiting = true;

        const formData: FormData = new FormData();
        formData.append('entityName', this.entityName);
        formData.append('entityKey', this.entityKey);
        if (this.folder) {
            formData.append('folder', this.folder);
        }
        for (const file of files) {
            formData.append('files', file);
        }

        this._attachmentService
            .upload(formData)
            .pipe(untilDestroyed(this))
            .subscribe({
                next: (data: any) => {
                    this.appUploadFile.resetFile();
                },
                error: error => {
                    console.error(error);
                    // this._toastr.error('Upload Template', 'Error!');
                },
            })
            .add(() => {
                this.waiting = false;
            });
    }

    loadAttachments() {
        this._changeDetectorRef.reattach();
        this.loading = true;
        this.setAttachments([]);
        this._changeDetectorRef.detectChanges();

        this.attachmentSearchParameters.pageIndex = 0;
        this.attachmentSearchParameters.pageSize = 100;
        this.attachmentSearchParameters.entityName = this.entityName;
        this.attachmentSearchParameters.entityKey = this.entityKey;

        this._attachmentService
            .listEntities(this.attachmentSearchParameters)
            .pipe(untilDestroyed(this))
            .subscribe({
                next: (items: PaginatedList<Attachment>) => {
                    this.setAttachments(items.items);
                },
                error: error => {
                    this.loading = false;
                    console.error(error);
                    // this._toastr.error(error.detail, 'Error!');
                },
            })
            .add(() => {
                this.loading = false;
                this._changeDetectorRef.detectChanges();
            });
    }

    setAttachments(attachments: Attachment[]) {
        this.attachments = attachments;

        this.dataSource = new MatTableDataSource(this.attachments ?? []);

        setTimeout(() => (this.dataSource.paginator = this.paginator));
        setTimeout(() => (this.dataSource.sort = this.sort));

        console.log('attachments', this.attachments);
    }

    delete(attachment: Attachment) {
        // console.log('delete')
        this._confirmationDialogService
            .showWarningMessage({
                title: 'Are you sure?',
                text: "Confermi l'eliminazione di questo Attachment?",
                showCancelButton: true,
                confirmButtonText: 'Confirm',
            })
            .then(result => {
                if (result.value) {
                    this.loading = true;
                    this._attachmentService.delete(attachment.id).subscribe({
                        next: () => {
                            // this._toastr.success('Attachment successfully deleted');
                            this.attachments = this.attachments.filter(item => item.id !== attachment.id);

                            this.onListChanged.emit();
                        },
                        error: error => {
                            this.loading = false;
                            console.error(error);
                            // this._toastr.error(error.detail, 'Error!');
                        },
                    });
                }
            });
    }

    deleteAll() {
        this._confirmationDialogService
            .showWarningMessage({
                title: 'Are you sure?',
                text: "Confermi l'eliminazione di tutti gli Attachment di questa cartella?",
                showCancelButton: true,
                confirmButtonText: 'Confirm',
            })
            .then(result => {
                const attachment = this.attachments[0];

                if (result.value) {
                    this.loading = true;
                    this._attachmentService
                        .deleteAll(attachment.entityName, attachment.entityKey, attachment.folder)
                        .subscribe({
                            next: () => {
                                // this._toastr.success('Attachments successfully deleted');
                                this.attachments = [];

                                this.onListChanged.emit();
                            },
                            error: error => {
                                this.loading = false;
                                console.error(error);
                                // this._toastr.error(error.detail, 'Error!');
                            },
                        });
                }
            });
    }

    download(attachment: Attachment) {
        console.log('download');
    }

    openPdf(attachment: Attachment) {
        console.log('openPdf');
    }

    openCix(attachment: Attachment) {
        console.log('openCix');
    }

    openXml(attachment: Attachment) {
        console.log('openXml');
    }
}
