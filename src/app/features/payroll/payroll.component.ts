import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PayrollStore } from '../../store/payroll.store';
import { CommonTableComponent, Column } from '../../shared/components/common-table/common-table.component';
import { CommonButtonComponent } from '../../shared/components/common-button.component/common-button.component';
import { CommonMonthPickerComponent } from '../../shared/components/datepicker/common-month-picker/common-month-picker.component';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ManualPayrollModalComponent } from '../settings/pages/components/manual-payroll-modal.component';

@Component({
    selector: 'app-payroll',
    standalone: true,
    imports: [
        CommonModule,
        CommonTableComponent,
        CommonButtonComponent,
        CommonMonthPickerComponent,
        CardModule,
        FormsModule,
        DialogModule,
        DividerModule,
        ManualPayrollModalComponent
    ],
    templateUrl: './payroll.component.html'
})
export class PayrollComponent implements OnInit {
    protected store = inject(PayrollStore);

    selectedMonth: Date | undefined = new Date();
    selectedRecord = signal<any>(null);
    showDetail = signal<boolean>(false);
    showBatchModal = signal<boolean>(false);

    columns: Column[] = [
        { field: 'employeeName', header: 'Employee' },
        { field: 'employee.department.name', header: 'Department' },
        { field: 'grossSalary', header: 'Gross' },
        { field: 'attendanceDeduction', header: 'Deductions' },
        { field: 'netSalary', header: 'Net Salary' },
        { field: 'status', header: 'Status', type: 'status' }
    ];

    processedRecords = computed(() => {
        return this.store.records().map(r => ({
            ...r,
            employeeName: `${r.employee?.personalDetails?.firstName || ''} ${r.employee?.personalDetails?.lastName || ''}`.trim() || r.employee?.user?.email
        }));
    });

    ngOnInit() {
        this.loadPayroll();
    }

    private getMonthParam(): string {
        const date = this.selectedMonth ?? new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    }

    loadPayroll() {
        this.store.loadRecords(this.getMonthParam());
    }

    onMonthChange(date: Date | undefined) {
        this.selectedMonth = date;
        this.loadPayroll();
    }

    onGenerate() {
        this.store.generatePayroll({ month: this.getMonthParam() });
    }

    onFinalize() {
        const firstRecord = this.store.records()[0];
        if (firstRecord && confirm('Are you sure you want to finalize this month\'s payroll? This cannot be undone.')) {
            this.store.finalizePayroll(firstRecord.payrollCycleId, this.getMonthParam());
        }
    }

    isEditing = signal<boolean>(false);
    otherDeductionsInput = signal<number>(0);

    onViewDetail(record: any) {
        this.selectedRecord.set(record);
        this.isEditing.set(false);
        this.showDetail.set(true);
    }

    onStartEdit() {
        const record = this.selectedRecord();
        if (record) {
            this.otherDeductionsInput.set(Number(record.otherDeductions || 0));
            this.isEditing.set(true);
        }
    }

    onCancelEdit() {
        this.isEditing.set(false);
    }

    onSaveAdjustment() {
        const record = this.selectedRecord();
        if (record) {
            this.store.updateRecord(record.id, {
                otherDeductions: this.otherDeductionsInput()
            }, this.getMonthParam());
            this.showDetail.set(false);
            this.isEditing.set(false);
        }
    }

    get canFinalize(): boolean {
        const records = this.store.records();
        return records.length > 0 && records[0].status !== 'finalized';
    }

    getAbsentDays(record: any): number {
        return Math.max(0, record.workingDays - record.presentDays);
    }

    getDailyRate(record: any): number {
        if (!record.workingDays) return 0;
        return Number(record.grossSalary) / record.workingDays;
    }

    getTotalDeductions(record: any): number {
        return Number(record.attendanceDeduction || 0) + 
               Number(record.pfDeduction || 0) + 
               Number(record.esiDeduction || 0) + 
               Number(record.ptDeduction || 0) +
               Number(record.incomeTax || 0) +
               Number(record.otherDeductions || 0);
    }

    get totalNetPayout(): number {
        return this.store.records().reduce((sum, r) => sum + Number(r.netSalary || 0), 0);
    }

    get totalDeductionsSum(): number {
        return this.store.records().reduce((sum, r) => sum + this.getTotalDeductions(r), 0);
    }

    onDownloadPayslip(record: any) {
        this.store.downloadPayslip(record.id);
    }
}