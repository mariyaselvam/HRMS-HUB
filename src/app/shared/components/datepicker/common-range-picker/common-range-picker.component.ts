import { Component, input, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule,
} from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-common-range-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePickerModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CommonRangePickerComponent),
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
        selectionMode="range"
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
export class CommonRangePickerComponent implements ControlValueAccessor {
  id = input<string>('range-picker-' + Math.random().toString(36).substring(2, 9));
  label = input<string>('');
  placeholder = input<string>('Select date range');
  showIcon = input<boolean>(true);
  error = input<string | null>(null);
  appendTo = input<any>('body');

  disabled = signal<boolean>(false);
  value: Date[] | null = null;

  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: Date[] | null): void {
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

  onDateChange(event: Date[] | null): void {
    this.value = event;
    this.onChange(event);
  }
}