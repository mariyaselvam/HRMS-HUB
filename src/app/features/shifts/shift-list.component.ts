import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShiftsStore } from '../../store/shifts.store';
import { EmployeeStore } from '../../store/employee.store';
import {
  CommonTableComponent,
  Column,
} from '../../shared/components/common-table/common-table.component';
import { CommonButtonComponent } from '../../shared/components/common-button.component/common-button.component';
import { CommonInputComponent } from '../../shared/components/common-input/common-input.component';
import { CommonSelectComponent } from '../../shared/components/common-select/common-select.component';
import { CommonDatePickerComponent } from '../../shared/components/datepicker/common-date-picker/common-date-picker.component';
import { CommonTimePickerComponent } from '../../shared/components/datepicker/common-time-picker/common-time-picker.component';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import {
  Shift,
  ShiftCreateInput,
  ShiftUpdateInput,
  BulkAssignShiftInput,
  TransferShiftInput,
} from '../../core/models/attendance.model';

@Component({
  selector: 'app-shift-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CommonTableComponent,
    CommonButtonComponent,
    CommonInputComponent,
    CommonSelectComponent,
    CommonDatePickerComponent,
    CommonTimePickerComponent,
    CardModule,
    DialogModule,
    TableModule,
    MultiSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './shift-list.component.html',
})
export class ShiftListComponent implements OnInit {
  private fb = inject(FormBuilder);
  protected store = inject(ShiftsStore);
  protected employeeStore = inject(EmployeeStore);

  // Computed from stores
  readonly shifts = this.store.shifts;
  readonly selectedShift = this.store.selectedShift;
  readonly shiftEmployees = this.store.shiftEmployees;
  readonly totalShiftEmployees = this.store.totalShiftEmployees;
  readonly loading = this.store.loading;

  // UI State
  showCreateDialog = false;
  showBulkAssign = false;
  showRemove = false;
  showTransfer = false;
  editMode = false;
  editingShiftId: string | null = null;

  employeePage = 1;
  employeeLimit = 10;
  employeeSearch = '';

  // Forms
  shiftForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    code: ['', [Validators.required, Validators.maxLength(20)]],
    startTime: ['', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)]],
    endTime: ['', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)]],
    graceMinutes: [0, [Validators.min(0), Validators.max(120)]],
    breakDuration: [0, [Validators.min(0), Validators.max(240)]],
    status: ['active'],
  });

  bulkAssignForm: FormGroup = this.fb.group({
    shiftId: ['', Validators.required],
    employeeIds: [[], Validators.required],
    effectiveFrom: [new Date().toISOString().split('T')[0], Validators.required],
  });

  bulkRemoveForm: FormGroup = this.fb.group({
    employeeIds: [[], Validators.required],
  });

  transferForm: FormGroup = this.fb.group({
    fromShiftId: ['', Validators.required],
    toShiftId: ['', Validators.required],
    employeeIds: [[], Validators.required],
    effectiveFrom: [new Date().toISOString().split('T')[0], Validators.required],
  });

  // Table columns for employees
  employeeColumns: Column[] = [
    { field: 'employeeCode', header: 'Employee Code' },
    { field: 'employeeName', header: 'Name' },
    { field: 'effectiveFrom', header: 'Effective From', type: 'date' },
    { field: 'isActive', header: 'Status', type: 'status' },
  ];

  shiftColumns: Column[] = [
    { field: 'name', header: 'Shift Name' },
    { field: 'code', header: 'Code' },
    { field: 'timings', header: 'Shift Timings' },
    { field: 'graceMinutes', header: 'Grace Period (min)', type: 'number' },
    { field: 'employeeCount', header: 'Assigned Employees', type: 'number' },
    { field: 'status', header: 'Status', type: 'status' },
  ];

  processedShifts = computed(() => {
    return this.shifts().map((s) => ({
      ...s,
      timings: `${this.formatTime(s.startTime)} - ${this.formatTime(s.endTime)}`
    }));
  });

  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ];

  selectedEmployees: any[] = [];

  ngOnInit() {
    this.store.loadShifts();
    this.employeeStore.loadEmployees();
  }

  // ─── Computed Options ─────────────────────────────────────────────────────

  get employeeOptions() {
    return this.employeeStore.employees().map((e) => ({
      label:
        `${e.personalDetails?.firstName || ''} ${e.personalDetails?.lastName || ''} (${e.employeeCode})`.trim() ||
        e.email,
      value: e.id,
    }));
  }

  get shiftOptions() {
    return this.shifts().map((s) => ({
      label: `${s.name} (${s.code})`,
      value: s.id,
    }));
  }

  get shiftEmployeeOptions() {
    return this.shiftEmployees().map((e) => ({
      label: `${e.employeeName} (${e.employeeCode})`,
      value: e.employeeId,
    }));
  }

  // ─── Shift Selection ──────────────────────────────────────────────────────

  selectShift(shift: Shift) {
    this.store.loadShiftById(shift.id);
    this.store.loadShiftEmployees(shift.id, {
      page: this.employeePage,
      limit: this.employeeLimit,
    });
  }

  deselectShift() {
    this.store.clearSelection();
    this.employeePage = 1;
    this.employeeSearch = '';
  }

  // ─── Employee Filters ────────────────────────────────────────────────────

  onSearch(event: any) {
    this.employeeSearch = event?.target?.value || '';
    this.employeePage = 1;
    this.reloadEmployees();
  }

  onEmployeePageChange(event: any) {
    this.employeePage = event;
    this.reloadEmployees();
  }

  private reloadEmployees() {
    const selectedShift = this.selectedShift();
    if (!selectedShift) return;

    this.store.loadShiftEmployees(selectedShift.id, {
      page: this.employeePage,
      limit: this.employeeLimit,
      search: this.employeeSearch || undefined,
    });
  }

  // ─── Create/Edit Shift ───────────────────────────────────────────────────

  openCreateDialog() {
    this.editMode = false;
    this.editingShiftId = null;
    this.shiftForm.reset({
      graceMinutes: 0,
      breakDuration: 0,
      status: 'active',
    });
    this.showCreateDialog = true;
  }

  openEditDialog(shift: Shift) {
    this.editMode = true;
    this.editingShiftId = shift.id;
    this.shiftForm.patchValue({
      name: shift.name,
      code: shift.code,
      startTime: shift.startTime,
      endTime: shift.endTime,
      graceMinutes: shift.graceMinutes,
      breakDuration: shift.breakDuration,
      status: shift.status,
    });
    this.showCreateDialog = true;
  }

  closeCreateDialog() {
    this.showCreateDialog = false;
    this.editMode = false;
    this.editingShiftId = null;
  }

  onSaveShift() {
    if (this.shiftForm.invalid) return;

    if (this.editMode && this.editingShiftId) {
      this.store.updateShift(this.editingShiftId, this.shiftForm.value as ShiftUpdateInput);
    } else {
      this.store.createShift(this.shiftForm.value as ShiftCreateInput);
    }

    this.closeCreateDialog();
  }

  // ─── Bulk Operations ─────────────────────────────────────────────────────

  onBulkAssign() {
    if (this.bulkAssignForm.invalid) return;
    this.store.bulkAssign(this.bulkAssignForm.value as BulkAssignShiftInput);
    this.showBulkAssign = false;
    this.bulkAssignForm.reset({
      effectiveFrom: new Date().toISOString().split('T')[0],
    });
  }

  openRemoveDialog() {
    this.bulkRemoveForm.reset({ employeeIds: [] });
    this.selectedEmployees = [];
    this.showRemove = true;
  }

  onBulkRemove() {
    if (this.bulkRemoveForm.invalid || !this.selectedShift()) return;
    this.store.bulkRemove({
      shiftId: this.selectedShift()!.id,
      employeeIds: this.bulkRemoveForm.value.employeeIds,
    });
    this.showRemove = false;
  }

  onTransfer() {
    if (this.transferForm.invalid) return;
    this.store.transfer(this.transferForm.value as TransferShiftInput);
    this.showTransfer = false;
    this.transferForm.reset({
      effectiveFrom: new Date().toISOString().split('T')[0],
    });
  }

  // ─── Format Helpers ──────────────────────────────────────────────────────

  formatTime(value: any): string {
    if (!value) return '';
    const timePart = String(value).split('T')[1] || '';
    return timePart.split(':').slice(0, 2).join(':');
  }
}
