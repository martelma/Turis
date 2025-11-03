import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { fuseAnimations } from '@fuse/animations';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [NgIf, CdkDrag, NgClass, MatButtonModule, CdkDragHandle, MatIconModule, CommonModule],
})
export class ModalComponent implements OnInit, AfterViewInit {
    @Input()
    showBackground = true;

    @Input()
    draggable = false;

    @Input()
    resizable = false;

    @Input()
    closable = true;

    @Input()
    modalTitle: string = null;

    @Input()
    description: string = null;

    @Input()
    closeOnClickOut = false;

    @Input()
    lgMinWidth = 1024;

    @Input()
    mdMinWidth = 768;

    @Input()
    minHeight = 480;

    @Input()
    lgMaxWidth = 50;

    @Output()
    closed: EventEmitter<void> = new EventEmitter();

    @ViewChild('modal')
    modalComponent: ElementRef;

    isOnTop = true;
    isInside = true;
    uuId: number;

    isScreenSmall: boolean;
    isScreenMid: boolean;

    constructor(private _fuseMediaWatcherService: FuseMediaWatcherService) {}

    @HostListener('click')
    clicked(): void {
        this.isInside = true;
    }

    @HostListener('document:click')
    clickedOut(): void {
        if (!this.isInside) {
            this.bringBack();
        } else {
            this.bringOnTop();
        }

        this.isInside = false;
    }

    ngAfterViewInit(): void {
        this.calcSize();
    }

    calcSize(): void {
        if (!this.modalComponent) {
            return;
        }

        if (this.showBackground) {
            let prefix = 'max-height: 90vh;';

            if (!this.isScreenSmall) {
                prefix += `max-width: ${this.lgMaxWidth}vw;`;
            }

            if (this.isScreenSmall) {
                this.modalComponent.nativeElement.setAttribute(
                    'style',
                    prefix + 'min-width: 100% !important; min-height: 100% !important',
                );
            } else if (this.isScreenMid) {
                this.modalComponent.nativeElement.setAttribute(
                    'style',
                    prefix + `min-width: ${this.mdMinWidth}px !important; min-height: ${this.minHeight}px !important`,
                );
            } else {
                this.modalComponent.nativeElement.setAttribute(
                    'style',
                    prefix + `min-width: ${this.lgMinWidth}px !important; min-height: ${this.minHeight}px !important`,
                );
            }
        } else {
            let prefix = 'max-height: 90vh; position:fixed; left:50%; top:50%; transform: translate(-50%, -50%);';

            if (!this.isScreenSmall) {
                prefix += `max-width: ${this.lgMaxWidth}vw;`;
            }

            if (this.isScreenSmall) {
                this.modalComponent.nativeElement.setAttribute(
                    'style',
                    prefix + 'min-width: 100% !important; min-height: 100% !important',
                );
            } else if (this.isScreenMid) {
                this.modalComponent.nativeElement.setAttribute(
                    'style',
                    prefix + `min-width: ${this.mdMinWidth}px !important; min-height: ${this.minHeight}px !important`,
                );
            } else {
                this.modalComponent.nativeElement.setAttribute(
                    'style',
                    prefix + `min-width: ${this.lgMinWidth}px !important; min-height: ${this.minHeight}px !important`,
                );
            }
        }
    }

    ngOnInit(): void {
        this.uuId = Date.now();

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$.pipe(untilDestroyed(this)).subscribe(({ matchingAliases }) => {
            // Check if the screen is small
            this.isScreenSmall = !matchingAliases.includes('md');

            if (!this.isScreenSmall) {
                this.isScreenMid = !matchingAliases.includes('lg');
            }

            this.calcSize();
        });

        this.bringOnTop();
    }

    closeEvent(): void {
        this.closed.emit();
    }

    bringOnTop(): void {
        this.isOnTop = true;
    }

    bringBack(): void {
        this.isOnTop = false;
    }
}
