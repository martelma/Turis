import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

import Cropper from 'cropperjs';

@Component({
    selector: 'image-cropper',
    templateUrl: 'image-cropper.component.html',
    styleUrls: ['image-cropper.component.scss'],
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule],
})
export class ImageCropperComponent implements OnInit, AfterViewInit {
    sanitizedUrl!: SafeUrl;
    cropper!: Cropper;

    constructor(
        public dialogRef: MatDialogRef<ImageCropperComponent>,
        @Inject(MAT_DIALOG_DATA) public image: string,
        private _sanitizer: DomSanitizer,
    ) {}

    ngOnInit(): void {
        this.sanitizedUrl = this._sanitizer.bypassSecurityTrustUrl(this.image);
    }

    ngAfterViewInit(): void {
        this.initCropper();
    }

    initCropper(): void {
        const image = document.getElementById('image') as HTMLImageElement;
        this.cropper = new Cropper(image, {
            aspectRatio: 1,
            viewMode: 1,
            guides: false,
        });
    }

    getRoundedCanvas(sourceCanvas: any) {
        const canvas = document.createElement('canvas');
        const context: any = canvas.getContext('2d');
        const width = sourceCanvas.width;
        const height = sourceCanvas.height;

        canvas.width = width;
        canvas.height = height;
        context.imageSmoothingEnabled = true;
        context.drawImage(sourceCanvas, 0, 0, width, height);
        context.globalCompositeOperation = 'destination-in';
        context.beginPath();
        context.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, 2 * Math.PI, true);
        context.fill();

        return canvas;
    }

    crop(): void {
        const croppedCanvas = this.cropper.getCroppedCanvas();
        const roundedCanvas = this.getRoundedCanvas(croppedCanvas);

        const roundedImage = document.createElement('img');

        if (roundedImage) {
            this.dialogRef.close(roundedCanvas.toDataURL());
        } else {
            return this.dialogRef.close(null);
        }
    }

    reset(): void {
        this.cropper.clear();
        this.cropper.crop();
    }
}
