import { Component, input, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-common-datepicker',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DatePickerModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CommonDatepickerComponent),
      multi: true,
    },
  ],
  templateUrl: './common-datepicker.component.html',
  styleUrl: './common-datepicker.component.css',
})
export class CommonDatepickerComponent implements ControlValueAccessor {
  id = input<string>('datepicker-' + Math.random().toString(36).substring(2, 9));
  label = input<string>('');
  placeholder = input<string>('Select date');
  dateFormat = input<string>('yy-mm-dd');
  showIcon = input<boolean>(true);
  timeOnly = input<boolean>(false);
  hourFormat = input<string>('24');
  error = input<string | null>(null);
  selectionMode = input<'single' | 'range' | 'multiple'>('single');
  appendTo = input<any>('body');
  view = input<'date' | 'month' | 'year'>('date');

  disabled = signal<boolean>(false);
  value: any = null;

  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    if (typeof value === 'string' && value) {
      if (value.includes('-')) {
        const parts = value.split('-');
        if (parts.length === 2) {
          this.value = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
        } else {
          this.value = new Date(value);
        }
      } else if (value.includes(':')) {
        const parts = value.split(':');
        const d = new Date();
        d.setHours(Number(parts[0]), Number(parts[1]));
        this.value = d;
      } else {
        this.value = value;
      }
    } else {
      this.value = value;
    }
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

  onDateChange(event: any): void {
    this.value = event;
    if (this.selectionMode() === 'range') {
      this.onChange(event);
      return;
    }

    if (event instanceof Date) {
      if (this.timeOnly()) {
        const hours = String(event.getHours()).padStart(2, '0');
        const minutes = String(event.getMinutes()).padStart(2, '0');
        this.onChange(`${hours}:${minutes}`);
      } else if (this.view() === 'month') {
        const year = event.getFullYear();
        const month = String(event.getMonth() + 1).padStart(2, '0');
        this.onChange(`${year}-${month}`);
      } else {
        const year = event.getFullYear();
        const month = String(event.getMonth() + 1).padStart(2, '0');
        const day = String(event.getDate()).padStart(2, '0');
        this.onChange(`${year}-${month}-${day}`);
      }
    } else {
      this.onChange(event);
    }
  }

  onBlur(): void {
    this.onTouched();
  }
}
