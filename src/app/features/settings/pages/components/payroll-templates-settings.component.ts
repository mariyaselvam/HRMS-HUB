import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { CommonButtonComponent } from '../../../../shared/components/common-button.component/common-button.component';
import { CommonInputComponent } from '../../../../shared/components/common-input/common-input.component';
import {
  SalaryConfigService,
  SalaryTemplateConfig,
  SalaryComponentConfig,
} from '../../../../core/services/salary-config.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-payroll-templates-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    DialogModule,
    SelectModule,
    InputTextModule,
    CommonButtonComponent,
    CommonInputComponent,
  ],
  template: `
    <div
      class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
    >
      <div class="flex justify-between items-center mb-6">
        <div>
          <h3 class="text-lg font-semibold text-slate-800 dark:text-white">Salary Templates</h3>
          <p class="text-sm text-slate-500">Configure salary structures mapping rules for roles.</p>
        </div>
        <app-button label="Add Template" icon="pi pi-plus" (onClick)="openCreate()"></app-button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Templates List -->
        <div class="space-y-4">
          <div
            *ngFor="let temp of templates()"
            class="p-4 rounded-xl border cursor-pointer transition-colors"
            [ngClass]="{
              'border-indigo-600 bg-indigo-50/10': selectedTemplateId() === temp.id,
              'border-slate-200 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50':
                selectedTemplateId() !== temp.id,
            }"
            (click)="selectTemplate(temp)"
          >
            <h4 class="font-bold text-slate-800 dark:text-white">{{ temp.name }}</h4>
            <p class="text-xs text-slate-500 mt-1">
              {{ temp.description || 'No description provided' }}
            </p>
            <div class="text-xs text-slate-600 dark:text-slate-400 mt-2">
              Contains {{ temp.items?.length || 0 }} components
            </div>
          </div>
        </div>

        <!-- Template Details / Component list -->
        <div
          *ngIf="activeTemplate()"
          class="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 space-y-4"
        >
          <div
            class="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800"
          >
            <div>
              <h4 class="font-bold text-lg text-slate-800 dark:text-white">
                {{ activeTemplate()?.name }}
              </h4>
              <p class="text-xs text-slate-500">{{ activeTemplate()?.description }}</p>
            </div>
          </div>

          <!-- Component list table -->
          <div class="space-y-2">
            <h5 class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Configured Formula Split
            </h5>
            <table class="w-full text-xs text-left border-collapse">
              <thead>
                <tr class="text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <th class="py-2">Component</th>
                  <th class="py-2">Type</th>
                  <th class="py-2">Calculation Rule</th>
                  <th class="py-2 text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="let item of activeTemplate()?.items"
                  class="border-b border-slate-100 dark:border-slate-800/40"
                >
                  <td class="py-2.5 font-medium text-slate-800 dark:text-slate-200">
                    {{ item.component.name }}
                  </td>
                  <td
                    class="py-2.5 uppercase text-[10px] font-semibold"
                    [ngClass]="
                      item.component.type === 'earning' ? 'text-teal-600' : 'text-rose-600'
                    "
                  >
                    {{ item.component.type }}
                  </td>
                  <td class="py-2.5 text-slate-500">
                    {{ item.calcType || item.component.calcType }}
                  </td>
                  <td class="py-2.5 text-right font-semibold">
                    {{ item.calcValue !== null ? item.calcValue : item.component.calcValue }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Preview engine block -->
          <div
            class="p-4 bg-indigo-50/10 rounded-xl border border-indigo-100 dark:border-indigo-950/20 space-y-3"
          >
            <h5 class="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              Salary Calculator Engine Preview
            </h5>
            <div class="flex gap-4">
              <app-common-input
                label="Monthly CTC to preview (₹)"
                [(ngModel)]="previewCtc"
                type="number"
                placeholder="e.g. 50000"
                class="flex-1"
              ></app-common-input>
              <app-button
                label="Calculate"
                class="self-end mb-1"
                (onClick)="calculatePreview()"
              ></app-button>
            </div>

            <!-- Result display -->
            <div
              *ngIf="previewResult()"
              class="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs"
            >
              <div *ngFor="let row of previewResult()?.breakdown" class="flex justify-between">
                <span class="text-slate-500">{{ row.name }} ({{ row.code }}):</span>
                <span
                  class="font-medium text-slate-800 dark:text-slate-200"
                  [ngClass]="
                    row.type === 'earning' ? 'text-slate-800 dark:text-slate-200' : 'text-rose-600'
                  "
                >
                  {{ row.type === 'earning' ? '+' : '-' }} ₹{{ row.value | number }}
                </span>
              </div>
              <div
                class="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-sm font-bold"
              >
                <span class="text-slate-900 dark:text-white">Net Take Home Pay:</span>
                <span class="text-teal-600">₹{{ previewResult()?.netSalary | number }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Template Modal -->
    <p-dialog
      [(visible)]="showModal"
      header="Create Salary Template"
      [modal]="true"
      [style]="{ width: '600px' }"
    >
      <div class="space-y-4 pt-3">
        <app-common-input
          label="Template Name"
          [(ngModel)]="form.name"
          placeholder="e.g. Software Engineer Level 2"
        ></app-common-input>
        <app-common-input
          label="Description"
          [(ngModel)]="form.description"
          placeholder="e.g. For general SDEs in India"
        ></app-common-input>

        <!-- Items editor -->
        <div class="space-y-3 pt-2">
          <div class="flex justify-between items-center">
            <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Salary Components Mappings
            </h4>
            <app-button label="Add Component Row" (onClick)="addComponentRow()"></app-button>
          </div>

          <div
            *ngFor="let row of form.items; let idx = index"
            class="grid grid-cols-12 gap-3 items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800"
          >
            <div class="col-span-4">
              <p-select
                [options]="componentsList()"
                optionLabel="name"
                optionValue="id"
                [(ngModel)]="row.salaryComponentId"
                placeholder="Choose component"
                class="w-full text-xs"
              ></p-select>
            </div>
            <div class="col-span-3">
              <p-select
                [options]="calcTypeOptions"
                optionLabel="label"
                optionValue="value"
                [(ngModel)]="row.calcType"
                placeholder="Override rule"
                class="w-full text-xs"
              ></p-select>
            </div>
            <div class="col-span-3">
              <input
                type="number"
                pInputText
                [(ngModel)]="row.calcValue"
                placeholder="Value override"
                class="w-full text-xs"
              />
            </div>
            <div class="col-span-1 text-center font-bold text-xs text-slate-400">
              #{{ idx + 1 }}
            </div>
            <div class="col-span-1 text-right">
              <button
                pButton
                icon="pi pi-trash"
                class="p-button-danger p-button-text p-button-sm"
                (click)="removeComponentRow(idx)"
              ></button>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            pButton
            label="Cancel"
            class="p-button-text p-button-secondary"
            (click)="showModal.set(false)"
          ></button>
          <app-button label="Save Template" (onClick)="onSave()" [loading]="saving()"></app-button>
        </div>
      </div>
    </p-dialog>
  `,
})
export class PayrollTemplatesSettingsComponent implements OnInit {
  private service = inject(SalaryConfigService);
  private notify = inject(NotificationService);

  templates = signal<SalaryTemplateConfig[]>([]);
  componentsList = signal<SalaryComponentConfig[]>([]);

  selectedTemplateId = signal<string | null>(null);
  activeTemplate = signal<SalaryTemplateConfig | null>(null);

  loading = signal<boolean>(false);
  saving = signal<boolean>(false);
  showModal = signal<boolean>(false);

  // Preview Calculator state
  previewCtc = signal<number>(50000);
  previewResult = signal<any | null>(null);

  form: any = {
    name: '',
    description: '',
    items: [],
  };

  calcTypeOptions = [
    { label: 'Fixed Amount (₹)', value: 'fixed' },
    { label: 'Percentage of CTC (%)', value: 'pct_ctc' },
    { label: 'Percentage of Basic (%)', value: 'pct_basic' },
    { label: 'Percentage of Gross (%)', value: 'pct_gross' },
    { label: 'Manual Input', value: 'manual' },
    { label: 'Remaining CTC Balance', value: 'remaining' },
  ];

  ngOnInit() {
    this.loadTemplates();
    this.loadComponents();
  }

  loadTemplates() {
    this.loading.set(true);
    this.service
      .getTemplates()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.templates.set(data);
          if (data.length > 0 && !this.selectedTemplateId()) {
            this.selectTemplate(data[0]);
          }
        },
        error: (err) => this.notify.error('Error', 'Failed to load templates'),
      });
  }

  loadComponents() {
    this.service.getComponents().subscribe({
      next: (data) => this.componentsList.set(data),
    });
  }

  selectTemplate(temp: SalaryTemplateConfig) {
    this.selectedTemplateId.set(temp.id || null);
    this.activeTemplate.set(temp);
    this.previewResult.set(null);
  }

  calculatePreview() {
    const id = this.selectedTemplateId();
    const ctc = this.previewCtc();
    if (!id || !ctc) return;

    this.loading.set(true);
    this.service
      .calculatePreview(id, ctc)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => this.previewResult.set(res),
        error: (err) => this.notify.error('Calculation Error', 'Failed to calculate preview'),
      });
  }

  openCreate() {
    this.form = {
      name: '',
      description: '',
      items: [],
    };
    this.showModal.set(true);
  }

  addComponentRow() {
    this.form.items.push({
      salaryComponentId: '',
      calcType: 'fixed',
      calcValue: 0,
      calculationOrder: this.form.items.length,
    });
  }

  removeComponentRow(idx: number) {
    this.form.items.splice(idx, 1);
  }

  onSave() {
    this.saving.set(true);
    this.service
      .createTemplate(this.form)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (temp) => {
          this.notify.success('Success', 'Template saved successfully');
          this.showModal.set(false);
          this.selectedTemplateId.set(temp.id || null);
          this.loadTemplates();
        },
        error: (err) => this.notify.error('Error', err.error?.message || 'Failed to save template'),
      });
  }
}
