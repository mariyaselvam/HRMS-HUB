import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import {
  CommonTableComponent,
  Column,
} from '../../../../shared/components/common-table/common-table.component';
import { CommonButtonComponent } from '../../../../shared/components/common-button.component/common-button.component';
import { CommonSelectComponent } from '../../../../shared/components/common-select/common-select.component';
import { CommonInputComponent } from '../../../../shared/components/common-input/common-input.component';
import {
  SalaryConfigService,
  SalaryComponentConfig,
} from '../../../../core/services/salary-config.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-payroll-components-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    DialogModule,
    SelectModule,
    InputTextModule,
    CommonTableComponent,
    CommonButtonComponent,
    CommonSelectComponent,
    CommonInputComponent,
  ],
  template: `
    <div
      class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
    >
      <div class="flex justify-between items-center mb-6">
        <div>
          <h3 class="text-lg font-semibold text-slate-800 dark:text-white">Salary Components</h3>
          <p class="text-sm text-slate-500">Manage earnings, allowances, and deduction rules.</p>
        </div>
        <app-button label="Add Component" icon="pi pi-plus" (onClick)="openCreate()"></app-button>
      </div>

      <app-common-table
        [data]="components()"
        [columns]="columns"
        [loading]="loading()"
        [hasActions]="true"
        (edit)="openEdit($event)"
        (delete)="onDelete($event)"
      ></app-common-table>
    </div>

    <!-- Create/Edit Modal -->
    <p-dialog
      [(visible)]="showModal"
      [header]="editId() ? 'Edit Component' : 'Add Component'"
      [modal]="true"
      [style]="{ width: '450px' }"
    >
      <div class="space-y-4 pt-3">
        <app-common-input
          label="Component Name"
          [(ngModel)]="form.name"
          placeholder="e.g. Basic Salary"
        ></app-common-input>
        <app-common-input
          label="Component Code"
          [(ngModel)]="form.code"
          placeholder="e.g. BASIC"
          [disabled]="!!editId()"
        ></app-common-input>

        <app-common-select
          label="Type"
          [options]="typeOptions"
          [(ngModel)]="form.type"
        ></app-common-select>
        <app-common-select
          label="Calculation Type"
          [options]="calcTypeOptions"
          [(ngModel)]="form.calcType"
        ></app-common-select>

        <app-common-input
          label="Default Value (e.g. % or ₹)"
          [(ngModel)]="form.calcValue"
          type="number"
          placeholder="e.g. 40 or 1500"
        ></app-common-input>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <label
            class="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
          >
            <input
              type="checkbox"
              [(ngModel)]="form.isTaxable"
              class="w-4 h-4 rounded text-indigo-600"
            />
            Taxable
          </label>
          <label
            class="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
          >
            <input
              type="checkbox"
              [(ngModel)]="form.pfApplicable"
              class="w-4 h-4 rounded text-indigo-600"
            />
            PF
          </label>
          <label
            class="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
          >
            <input
              type="checkbox"
              [(ngModel)]="form.esiApplicable"
              class="w-4 h-4 rounded text-indigo-600"
            />
            ESI
          </label>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            pButton
            label="Cancel"
            class="p-button-text p-button-secondary"
            (click)="showModal.set(false)"
          ></button>
          <app-button label="Save Component" (onClick)="onSave()" [loading]="saving()"></app-button>
        </div>
      </div>
    </p-dialog>
  `,
})
export class PayrollComponentsSettingsComponent implements OnInit {
  private service = inject(SalaryConfigService);
  private notify = inject(NotificationService);

  components = signal<SalaryComponentConfig[]>([]);
  loading = signal<boolean>(false);
  saving = signal<boolean>(false);
  showModal = signal<boolean>(false);
  editId = signal<string | null>(null);

  form: any = {
    name: '',
    code: '',
    type: 'earning',
    calcType: 'fixed',
    calcValue: 0,
    isTaxable: true,
    pfApplicable: false,
    esiApplicable: false,
  };

  columns: Column[] = [
    { field: 'name', header: 'Name' },
    { field: 'code', header: 'Code' },
    { field: 'type', header: 'Type' },
    { field: 'calcType', header: 'Calculation Rule' },
    { field: 'calcValue', header: 'Default Value', type: 'number' },
  ];

  typeOptions = [
    { label: 'Earning', value: 'earning' },
    { label: 'Deduction', value: 'deduction' },
  ];

  calcTypeOptions = [
    { label: 'Fixed Amount (₹)', value: 'fixed' },
    { label: 'Percentage of CTC (%)', value: 'pct_ctc' },
    { label: 'Percentage of Basic (%)', value: 'pct_basic' },
    { label: 'Percentage of Gross (%)', value: 'pct_gross' },
    { label: 'Manual Input', value: 'manual' },
    { label: 'Remaining CTC Balance', value: 'remaining' },
  ];

  ngOnInit() {
    this.loadComponents();
  }

  loadComponents() {
    this.loading.set(true);
    this.service
      .getComponents()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.components.set(data),
        error: (err) => this.notify.error('Error', 'Failed to load components'),
      });
  }

  openCreate() {
    this.editId.set(null);
    this.form = {
      name: '',
      code: '',
      type: 'earning',
      calcType: 'fixed',
      calcValue: 0,
      isTaxable: true,
      pfApplicable: false,
      esiApplicable: false,
    };
    this.showModal.set(true);
  }

  openEdit(component: any) {
    this.editId.set(component.id);
    this.form = { ...component };
    this.showModal.set(true);
  }

  onSave() {
    this.saving.set(true);
    const req = this.editId()
      ? this.service.updateComponent(this.editId()!, this.form)
      : this.service.createComponent(this.form);

    req.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.notify.success('Success', 'Component saved successfully');
        this.showModal.set(false);
        this.loadComponents();
      },
      error: (err) => this.notify.error('Error', err.error?.message || 'Failed to save component'),
    });
  }

  onDelete(component: any) {
    if (confirm(`Are you sure you want to delete component ${component.name}?`)) {
      this.loading.set(true);
      this.service
        .deleteComponent(component.id)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: () => {
            this.notify.success('Deleted', 'Component removed');
            this.loadComponents();
          },
          error: (err) => this.notify.error('Error', 'Failed to delete component'),
        });
    }
  }
}
