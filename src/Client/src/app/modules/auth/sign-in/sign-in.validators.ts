import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

export function emailOrUsernameValidator(usernameRe: RegExp): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const usernameValidator = Validators.pattern(usernameRe);
        return control.value?.includes('@') ? Validators.email(control) : usernameValidator(control);
    };
}
