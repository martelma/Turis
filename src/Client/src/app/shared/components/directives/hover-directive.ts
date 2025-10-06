import { Directive, HostListener, ElementRef, Input, Output, EventEmitter } from '@angular/core';

@Directive({
    selector: '[appHover]',
    standalone: true,
})
export class HoverDirective {
    @Input() hoverBgColor = 'bg-yellow-200';
    @Input() hoverCursor = 'pointer';
    @Output() hoverClick = new EventEmitter<MouseEvent>();

    constructor(private el: ElementRef) {}

    ngOnInit() {
        this.el.nativeElement.style.cursor = this.hoverCursor;
    }

    @HostListener('mouseenter') onMouseEnter() {
        this.el.nativeElement.classList.add(this.hoverBgColor);
    }

    @HostListener('mouseleave') onMouseLeave() {
        this.el.nativeElement.classList.remove(this.hoverBgColor);
    }

    @HostListener('click', ['$event']) onClick(event: MouseEvent) {
        this.hoverClick.emit(event);
    }
}
