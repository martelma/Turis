import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'search',
    standalone: true,
})
export class SearchPipe implements PipeTransform {
    public transform(value, keys: string, term: string) {
        if (!term) return value;
        return (value || []).filter(item =>
            keys
                .split(',')
                .some(key => Object.prototype.hasOwnProperty.call(item, key) && new RegExp(term, 'gi').test(item[key])),
        );
    }
}
