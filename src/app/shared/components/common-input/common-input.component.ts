import { Component, input, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
    selector: 'app-common-input',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, InputTextModule, FloatLabelModule, IconFieldModule, InputIconModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CommonInputComponent),
            multi: true
        }
    ],
    templateUrl: './common-input.component.html',
    styleUrl: './common-input.component.css'
})
export class CommonInputComponent implements ControlValueAccessor {
    id = input<string>('input-' + Math.random().toString(36).substring(2, 9));
    label = input<string>('');
    type = input<string>('text');
    placeholder = input<string>('');
    hint = input<string>('');
    error = input<string | null>(null);
    icon = input<string | null>(null);
    iconPosition = input<'left' | 'right'>('left');
    disabled = signal<boolean>(false);
    value: string = '';

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
