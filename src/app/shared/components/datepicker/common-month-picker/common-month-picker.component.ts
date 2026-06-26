import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-common-month-picker',
  standalone: true,
  imports: [DatePickerModule, FormsModule],
  template: `
    <div class="flex flex-col gap-2 w-full">
      @if (label) {
        <div class="flex justify-between items-center w-full h-[15px]">
          <label
            class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em]"
            >{{ label }}</label
          >
        </div>
      }
      <p-datepicker
        [ngModel]="value"
        view="month"
        dateFormat="mm/yy"
        [readonlyInput]="true"
        [placeholder]="placeholder"
        class="form-datepicker"
        (ngModelChange)="onDateSelected($event)"
      />
    </div>
  `,
  // styles: [`
  //   :host { display: block; width: 100%; }
  //   :host ::ng-deep .form-datepicker { width: 100%; }
  //   :host ::ng-deep .form-datepicker .p-inputtext {
  //     @apply w-full rounded-xl py-2.5 px-3.5 border-[1.5px] border-slate-300 bg-white text-slate-800 text-sm transition-all outline-none;
  //   }
  //   .dark :host ::ng-deep .form-datepicker .p-inputtext {
  //     @apply border-slate-700 bg-slate-900 text-slate-100;
  //   }
  //   :host ::ng-deep .form-datepicker .p-inputtext:hover {
  //     @apply border-slate-400;
  //   }
  //   .dark :host ::ng-deep .form-datepicker .p-inputtext:hover {
  //     @apply border-slate-600;
  //   }
  //   :host ::ng-deep .form-datepicker .p-inputtext:focus {
  //     @apply border-indigo-500 ring-4 ring-indigo-500/10;
  //   }
  //   :host ::ng-deep .form-datepicker .p-datepicker-trigger {
  //     @apply border-[1.5px] border-slate-300 border-l-0 rounded-r-xl bg-slate-50 text-slate-500 transition-all;
  //   }
  //   .dark :host ::ng-deep .form-datepicker .p-datepicker-trigger {
  //     @apply border-slate-700 bg-slate-800 text-slate-400;
  //   }
  // `],
})
export class CommonMonthPickerComponent implements OnInit {
  @Input() label: string = '';
  @Input() placeholder: string = 'Select month';
  @Input() value: Date | undefined;

  @Output() valueChange = new EventEmitter<Date | undefined>();

  private _initialized = false;

  ngOnInit(): void {
    // Mark initialized after first render to skip emission on init
    setTimeout(() => { this._initialized = true; }, 0);
  }

  onDateSelected(selected: Date | undefined): void {
    if (!this._initialized) return;
    this.valueChange.emit(selected);
  }
}