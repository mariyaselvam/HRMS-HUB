import { Component, input, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule,
} from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-common-date-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePickerModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CommonDatePickerComponent),
      multi: true,
    },
  ],
  template: `
    <div class="flex flex-col gap-2 w-full">
      <div class="flex justify-between items-center w-full h-[15px]">
        <label
          [for]="id()"
          class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em]"
          >{{ label() }}</label
        >
        @if (error()) {
          <span class="text-rose-500 text-[10px] font-semibold uppercase tracking-[0.05em]">{{
            error()
          }}</span>
        }
      </div>
      <p-datepicker
        [inputId]="id()"
        [(ngModel)]="value"
        dateFormat="yy-mm-dd"
        [showIcon]="showIcon()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        class="form-datepicker"
        [class.datepicker-error]="error()"
        [appendTo]="appendTo()"
        (ngModelChange)="onDateChange($event)"
        (onBlur)="onTouched()"
      />
    </div>
  `,
  styleUrl: '../datepicker-shared.css',
})
export class CommonDatePickerComponent implements ControlValueAccessor {
  id = input<string>('date-picker-' + Math.random().toString(36).substring(2, 9));
  label = input<string>('');
  placeholder = input<string>('Select date');
  showIcon = input<boolean>(true);
  error = input<string | null>(null);
  appendTo = input<any>('body');

  disabled = signal<boolean>(false);
  value: Date | null = null;

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
      } else {
        this.value = new Date(value);
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

  onDateChange(event: Date | null): void {
    this.value = event;
    if (event instanceof Date) {
      const year = event.getFullYear();
      const month = String(event.getMonth() + 1).padStart(2, '0');
      const day = String(event.getDate()).padStart(2, '0');
      this.onChange(`${year}-${month}-${day}`);
    } else {
      this.onChange(event);
    }
  }
}