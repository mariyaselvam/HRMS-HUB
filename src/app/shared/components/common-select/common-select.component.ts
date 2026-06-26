import { Component, input, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
    selector: 'app-common-select',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, SelectModule, FloatLabelModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CommonSelectComponent),
            multi: true
        }
    ],
    templateUrl: './common-select.component.html',
    styleUrl: './common-select.component.css'
})
export class CommonSelectComponent implements ControlValueAccessor {
    id = input<string>('select-' + Math.random().toString(36).substring(2, 9));
    label = input<string>('');
    options = input<any[]>([]);
    optionLabel = input<string>('label');
    optionValue = input<string>('value');
    placeholder = input<string>('');
    error = input<string | null>(null);
    appendTo = input<any>('body');
    disabled = signal<boolean>(false);
    value: any = null;

    onChange: any = () => { };
    onTouched: any = () => { };

    writeValue(value: any): void {
        this.value = value;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled.set(isDisabled);
    }

    onValueChange(value: any): void {
        this.value = value;
        this.onChange(value);
    }

    onBlur(): void {
        this.onTouched();
    }
}
