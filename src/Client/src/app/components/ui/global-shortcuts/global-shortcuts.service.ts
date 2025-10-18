import { Injectable } from '@angular/core';
import { ShortcutInput } from 'ng-keyboard-shortcuts';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GlobalShortcutsService {
    shortcuts$: BehaviorSubject<ShortcutInput[]> = new BehaviorSubject<ShortcutInput[]>([]);

    private shortcutsDictionary: { [key: string]: ShortcutInput[] } = {};
    private orderedComponentNames: string[] = [];

    addShortcuts(componentName: string, shortcuts: ShortcutInput[]) {
        this.orderedComponentNames.push(componentName);
        this.shortcutsDictionary[componentName] = shortcuts;
        this.shortcuts$.next(this.getShortcuts());
    }

    removeShortcuts(componentName: string) {
        delete this.shortcutsDictionary[componentName];
        this.orderedComponentNames = this.orderedComponentNames.filter(name => name !== componentName);
        this.shortcuts$.next(this.getShortcuts());
    }

    private getShortcuts(): ShortcutInput[] {
        const allShortcuts: ShortcutInput[] = [];
        const usedKeys = new Set<string>();

        for (const componentName of this.orderedComponentNames) {
            const shortcuts = this.shortcutsDictionary[componentName] || [];

            for (const shortcut of shortcuts) {
                if (usedKeys.has(shortcut.key as string)) {
                    const index = allShortcuts.findIndex(s => s.key === shortcut.key);
                    if (index !== -1) {
                        allShortcuts.splice(index, 1);
                    }
                }

                allShortcuts.push(shortcut);
                usedKeys.add(shortcut.key as string);
            }
        }

        return allShortcuts;
    }
}
