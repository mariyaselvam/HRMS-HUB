import { Injectable, signal, computed, inject } from '@angular/core';
import {
  Shift,
  ShiftState,
  ShiftCreateInput,
  ShiftUpdateInput,
  BulkAssignShiftInput,
  BulkRemoveShiftInput,
  TransferShiftInput,
  ShiftEmployeeFilter,
  ShiftEmployee,
  BulkOperationResult,
} from '../core/models/attendance.model';
import { BaseHttpService } from '../core/services/base-http.service';
import { API_ENDPOINTS } from '../core/constants/app.constants';
import { ApiResponse } from '../core/models/employee.model';
import { NotificationService } from '../core/services/notification.service';
import { finalize } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ShiftsStore {
  private http = inject(BaseHttpService);
  private notify = inject(NotificationService);

  // State
  private state = signal<ShiftState>({
    shifts: [],
    selectedShift: null,
    shiftEmployees: [],
    totalShiftEmployees: 0,
    bulkResults: [],
    loading: false,
    error: null,
  });

  // Selectors
  readonly shifts = computed(() => this.state().shifts);
  readonly selectedShift = computed(() => this.state().selectedShift);
  readonly shiftEmployees = computed(() => this.state().shiftEmployees);
  readonly totalShiftEmployees = computed(() => this.state().totalShiftEmployees);
  readonly bulkResults = computed(() => this.state().bulkResults);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  // ─── Shift CRUD ──────────────────────────────────────────────────────────

  loadShifts() {
    this.setLoading(true);
    this.http
      .get<ApiResponse<Shift[]>>(API_ENDPOINTS.SHIFTS)
      .pipe(finalize(() => this.setLoading(false)))
      .subscribe({
        next: (res) => this.state.update((s) => ({ ...s, shifts: res.data })),
        error: (err) => this.handleError('Failed to load shifts', err),
      });
  }

  loadShiftById(shiftId: string) {
    this.setLoading(true);
    this.http
      .get<ApiResponse<Shift>>(`${API_ENDPOINTS.SHIFTS}/${shiftId}`)
      .pipe(finalize(() => this.setLoading(false)))
      .subscribe({
        next: (res) => this.state.update((s) => ({ ...s, selectedShift: res.data })),
        error: (err) => this.handleError('Failed to load shift details', err),
      });
  }

  createShift(data: ShiftCreateInput) {
    this.setLoading(true);
    this.http
      .post<ApiResponse<Shift>>(API_ENDPOINTS.SHIFTS, data)
      .pipe(finalize(() => this.setLoading(false)))
      .subscribe({
        next: (res) => {
          this.state.update((s) => ({ ...s, shifts: [res.data, ...s.shifts] }));
          this.notify.success('Shift Created', `Successfully created ${res.data.name}`);
        },
        error: (err) => this.handleError('Failed to create shift', err),
      });
  }

  updateShift(shiftId: string, data: ShiftUpdateInput) {
    this.setLoading(true);
    this.http
      .patch<ApiResponse<Shift>>(`${API_ENDPOINTS.SHIFTS}/${shiftId}`, data)
      .pipe(finalize(() => this.setLoading(false)))
      .subscribe({
        next: (res) => {
          this.state.update((s) => ({
            ...s,
            shifts: s.shifts.map((sh) => (sh.id === shiftId ? res.data : sh)),
            selectedShift: s.selectedShift?.id === shiftId ? res.data : s.selectedShift,
          }));
          this.notify.success('Shift Updated', `Successfully updated ${res.data.name}`);
        },
        error: (err) => this.handleError('Failed to update shift', err),
      });
  }

  // ─── Bulk Assignment Operations ──────────────────────────────────────────

  bulkAssign(data: BulkAssignShiftInput) {
    this.setLoading(true);
    this.state.update((s) => ({ ...s, bulkResults: [] }));
    this.http
      .post<ApiResponse<BulkOperationResult[]>>(API_ENDPOINTS.SHIFT_ASSIGN, data)
      .pipe(finalize(() => this.setLoading(false)))
      .subscribe({
        next: (res) => {
          this.state.update((s) => ({ ...s, bulkResults: res.data }));
          const successCount = res.data.filter((r) => r.success).length;
          const failCount = res.data.filter((r) => !r.success).length;
          if (failCount > 0) {
            this.notify.warn(
              'Bulk Assign Partial',
              `${successCount} assigned, ${failCount} failed`,
            );
          } else {
            this.notify.success('Bulk Assign Complete', `${successCount} employees assigned`);
          }
          this.loadShifts(); // Refresh employee counts
        },
        error: (err) => this.handleError('Bulk assign failed', err),
      });
  }

  bulkRemove(data: BulkRemoveShiftInput) {
    this.setLoading(true);
    this.state.update((s) => ({ ...s, bulkResults: [] }));
    this.http
      .post<ApiResponse<BulkOperationResult[]>>(API_ENDPOINTS.SHIFT_REMOVE, data)
      .pipe(finalize(() => this.setLoading(false)))
      .subscribe({
        next: (res) => {
          this.state.update((s) => ({ ...s, bulkResults: res.data }));
          const successCount = res.data.filter((r) => r.success).length;
          this.notify.success('Bulk Remove Complete', `${successCount} employees removed`);
          this.loadShifts();
        },
        error: (err) => this.handleError('Bulk remove failed', err),
      });
  }

  transfer(data: TransferShiftInput) {
    this.setLoading(true);
    this.state.update((s) => ({ ...s, bulkResults: [] }));
    this.http
      .post<ApiResponse<BulkOperationResult[]>>(API_ENDPOINTS.SHIFT_TRANSFER, data)
      .pipe(finalize(() => this.setLoading(false)))
      .subscribe({
        next: (res) => {
          this.state.update((s) => ({ ...s, bulkResults: res.data }));
          const successCount = res.data.filter((r) => r.success).length;
          this.notify.success('Transfer Complete', `${successCount} employees transferred`);
          this.loadShifts();
        },
        error: (err) => this.handleError('Transfer failed', err),
      });
  }

  // ─── Shift Employee Queries ──────────────────────────────────────────────

  loadShiftEmployees(shiftId: string, filters: ShiftEmployeeFilter = {}) {
    this.setLoading(true);
    this.http
      .get<ApiResponse<{ total: number; records: ShiftEmployee[] }>>(
        API_ENDPOINTS.SHIFT_EMPLOYEES(shiftId),
        filters,
      )
      .pipe(finalize(() => this.setLoading(false)))
      .subscribe({
        next: (res) => {
          const data = res.data as any;
          const records = (Array.isArray(data) ? data : data?.records) || [];
          const total = (Array.isArray(data) ? data.length : data?.total) || 0;
          this.state.update((s) => ({
            ...s,
            shiftEmployees: records,
            totalShiftEmployees: total,
          }));
        },
        error: (err) => this.handleError('Failed to load shift employees', err),
      });
  }

  clearSelection() {
    this.state.update((s) => ({
      ...s,
      selectedShift: null,
      shiftEmployees: [],
      totalShiftEmployees: 0,
    }));
  }

  clearBulkResults() {
    this.state.update((s) => ({ ...s, bulkResults: [] }));
  }

  private setLoading(loading: boolean) {
    this.state.update((s) => ({ ...s, loading }));
  }

  private handleError(summary: string, error: any) {
    const errorMsg = error.error?.message || error.message || 'An unexpected error occurred';
    this.state.update((s) => ({ ...s, error: errorMsg }));
    this.notify.error(summary, errorMsg);
  }
}
