import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { NgIf, NgClass, NgFor, DecimalPipe, DatePipe, CommonModule } from '@angular/common';
import { UploadFilesComponent } from '../upload-files/upload-files.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { detailExpand } from 'app/shared/animations/detail-expand';
import { UserDateFormats } from 'app/constants';
import { Attachment } from './attachment.types';
import { AttachmentService } from './attachment.service';
import { ConfirmationDialogService } from 'app/shared/services/confirmation-dialog.service';

@UntilDestroy()
@Component({
    selector: 'app-attachments',
    templateUrl: './attachments.component.html',
    animations: [detailExpand],
    standalone: true,
    imports: [
        NgIf,
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
        NgFor,
        MatTooltipModule,
        DecimalPipe,
        DatePipe,
        UploadFilesComponent,
    ],
})
export class AttachmentsComponent implements OnInit, OnDestroy {
    @ViewChild('appUploadFile') appUploadFile: UploadFilesComponent;
    loading = false;
    waiting = false;
    uploadMode = false;

    selectedAttachment: any;
    displayedColumns: string[] = ['row', 'originalFileName', 'user', 'timeStamp', 'tools'];
    dataSource: MatTableDataSource<Attachment>;
    @ViewChild('matPaginator') matPaginator!: MatPaginator;
    @ViewChild('matSort') matSort!: MatSort;

    _attachments: Attachment[] = [];

    @Input() entityName: string;
    @Input() entityKey: string;
    @Input() folder: string;

    @Input()
    set attachments(items: any) {
        this._attachments = items;

        this.dataSource = new MatTableDataSource(this._attachments ?? []);

        setTimeout(() => (this.dataSource.paginator = items));
        setTimeout(() => (this.dataSource.sort = items));
    }
    get attachments(): Attachment[] {
        return this._attachments;
    }

    @Output() onListChanged = new EventEmitter<void>();

    pageIndex = 0;
    pageSize = 10;
    pageSizeOptions = [10, 15, 20, 30];

    userDateFormats = UserDateFormats;

    constructor(
        private _attachmentService: AttachmentService,
        private _confirmationDialogService: ConfirmationDialogService,
    ) {}

    ngOnInit(): void {}

    ngOnDestroy(): void {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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