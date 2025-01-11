import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-upload-files',
    templateUrl: './upload-files.component.html',
    standalone: true,
    imports: [NgxDropzoneModule, NgFor, NgIf, MatIconModule, MatButtonModule, MatCardModule],
})
export class UploadFilesComponent {
    @Input() title: string;
    @Input() enableCancel = false;
    @Output() onCancel: EventEmitter<any> = new EventEmitter();
    @Output() uploaded: EventEmitter<any> = new EventEmitter();

    waiting = false;
    files: any[] = [];

    constructor(
        protected router: Router,
        protected activatedRoute: ActivatedRoute,
    ) {}

    cancel(): void {
        this.onCancel.emit();
    }

    onFileSelect(event: any): void {
        if (this.files && this.files.length >= 2) {
            this.onFileRemove(this.files[0]);
        }
        this.files.push(...event.addedFiles);
    }

    onFileRemove(event: any): void {
        this.files.splice(this.files.indexOf(event), 1);
    }

    resetFile(): void {
        this.files = [];
    }

    uploadFile(): void {
        this.uploaded.emit(this.files);
    }
}
