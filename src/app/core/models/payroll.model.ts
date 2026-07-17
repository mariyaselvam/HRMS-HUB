export interface SalaryStructureItem {
    id: string;
    salaryStructureId: string;
    salaryComponentId: string;
    amount: number;
    component: {
        id: string;
        name: string;
        code: string;
        type: 'earning' | 'deduction';
        calcType: string;
        calcValue?: number;
    };
}

export interface SalaryStructure {
    id: string;
    employeeId: string;
    grossSalary: number;
    netSalary: number;
    effectiveFrom: string;
    isActive: boolean;
    createdAt: string;
    items?: SalaryStructureItem[];
}

export type PayrollStatus = 'draft' | 'finalized' | 'paid';

export interface PayrollCycle {
    id: string;
    month: string; // YYYY-MM
    status: PayrollStatus;
    totalAmount: number;
    generatedBy: string;
    createdAt: string;
}

export interface PayrollRecord {
    id: string;
    payrollCycleId: string;
    employeeId: string;
    basicSalary: number;
    hra: number;
    transportAllowance: number;
    otherAllowances: number;
    grossSalary: number;
    attendanceDeduction: number;
    leaveDeduction: number;
    pfDeduction: number;
    esiDeduction: number;
    ptDeduction: number;
    incomeTax: number;
    otherDeductions: number;
    overtimePay: number;
    netSalary: number;
    workingDays: number;
    presentDays: number;
    status: string;
    createdAt: string;
    // Relations
    employee?: {
        employeeCode: string;
        user: { email: string };
        department: { name: string };
        personalDetails: { firstName: string; lastName: string };
    };
}

export interface PayrollRun {
    id: string;
    companyId: string;
    payrollPeriod: string;
    runType: 'Manual' | 'Automatic';
    triggeredBy?: string;
    status: 'Processing' | 'Completed' | 'Failed';
    employeeCount: number;
    totalAmount: number;
    startedAt: string;
    completedAt?: string;
    errorMessage?: string;
}

export interface PayrollState {
    cycles: PayrollCycle[];
    records: PayrollRecord[];
    loading: boolean;
    error: string | null;
}

export interface SalarySetupInput {
    employeeId: string;
    grossSalary: number;
    effectiveFrom: string;
    items: {
        salaryComponentId: string;
        amount: number;
    }[];
}

export interface GeneratePayrollInput {
    month: string; // YYYY-MM
}