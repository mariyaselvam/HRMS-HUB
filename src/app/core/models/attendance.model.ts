export interface Shift {
    id: string;
    name: string;
    code: string;
    startTime: string; // "HH:mm" stored as Date in DB, returned as ISO string
    endTime: string;   // "HH:mm"
    graceMinutes: number;
    breakDuration: number;
    status: 'active' | 'inactive';
    companyId: string;
    createdAt: string;
    updatedAt: string;
    employeeCount?: number; // Included in list response
}

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'half_day';

export interface AttendanceLog {
    id: string;
    employeeId: string;
    shiftId?: string | null;
    workLocationId?: string | null;
    attendanceDate: string;   // ISO date string — comes as "attendanceDate" from backend
    checkIn: string | null;   // ISO datetime string
    checkOut: string | null;  // ISO datetime string
    totalHours: number | null; // Calculated on checkout
    status: AttendanceStatus;
    note?: string;
    createdAt: string;
    updatedAt: string;
    // Relations included from backend
    employee?: {
        employeeCode: string;
        user: { email: string };
    };
    shift?: {
        name: string;
    };
    workLocation?: {
        name: string;
    };
}

export interface AttendanceState {
    logs: AttendanceLog[];
    totalLogs: number;
    page: number;
    limit: number;
    shifts: Shift[];
    todayStatus: AttendanceLog | null;
    loading: boolean;
    error: string | null;
}

// Flow 2: POST /attendance/check-in
export interface CheckInInput {
    shiftId?: string;        // optional UUID
    workLocationId?: string; // optional UUID
    note?: string;           // optional note
}

// Flow 3: POST /attendance/check-out
export interface CheckOutInput {
    note?: string; // only note is accepted
}

// Flow 1: POST /attendance/shifts (legacy - kept for attendance module)
export interface CreateShiftInput {
    name: string;
    startTime: string;     // "HH:mm" format
    endTime: string;       // "HH:mm" format
    graceMinutes?: number; // optional, 0–60
}

// Flow 4: GET /attendance/logs filters
export interface AttendanceLogFilters {
    startDate?: string;  // YYYY-MM-DD
    endDate?: string;    // YYYY-MM-DD
    employeeId?: string; // optional UUID
    status?: AttendanceStatus;
    search?: string;
    page?: number;
    limit?: number;
}

export interface AssignShiftInput {
    employeeId: string;
    shiftId: string;
    effectiveFrom: string; // YYYY-MM-DD
}

// ─── New Enterprise Shift Management Interfaces ─────────────────────────────

export interface ShiftCreateInput {
    name: string;
    code: string;
    startTime: string;     // "HH:mm" format
    endTime: string;       // "HH:mm" format
    graceMinutes?: number;
    breakDuration?: number;
    status?: 'active' | 'inactive';
}

export interface ShiftUpdateInput {
    name?: string;
    code?: string;
    startTime?: string;
    endTime?: string;
    graceMinutes?: number;
    breakDuration?: number;
    status?: 'active' | 'inactive';
}

export interface BulkAssignShiftInput {
    shiftId: string;
    employeeIds: string[];
    effectiveFrom: string; // YYYY-MM-DD
}

export interface BulkRemoveShiftInput {
    shiftId: string;
    employeeIds: string[];
}

export interface TransferShiftInput {
    fromShiftId: string;
    toShiftId: string;
    employeeIds: string[];
    effectiveFrom: string; // YYYY-MM-DD
}

export interface ShiftEmployeeFilter {
    page?: number;
    limit?: number;
    search?: string;
    departmentId?: string;
    workLocationId?: string;
    status?: 'active' | 'inactive';
}

export interface ShiftEmployee {
    id: string;
    employeeId: string;
    employeeCode: string;
    employeeName: string;
    department: { id: string; name: string } | null;
    branch: { id: string; name: string } | null;
    shift: { id: string; name: string; code: string };
    isActive: boolean;
    effectiveFrom: string;
    effectiveTo: string | null;
    createdAt: string;
}

export interface ShiftEmployeeResponse {
    total: number;
    records: ShiftEmployee[];
}

export interface BulkOperationResult {
    employeeId: string;
    success: boolean;
    error?: string;
}

// ─── Shift Store State ──────────────────────────────────────────────────────
export interface ShiftState {
    shifts: Shift[];
    selectedShift: Shift | null;
    shiftEmployees: ShiftEmployee[];
    totalShiftEmployees: number;
    bulkResults: BulkOperationResult[];
    loading: boolean;
    error: string | null;
}

export function mapAttendanceLog(raw: any): AttendanceLog {
    return {
        id: raw.id,
        employeeId: raw.employeeId || raw.employee_id,
        shiftId: raw.shiftId || raw.shift_id,
        workLocationId: raw.workLocationId || raw.work_location_id,
        attendanceDate: raw.attendanceDate || raw.attendance_date,
        checkIn: raw.checkIn || raw.check_in,
        checkOut: raw.checkOut || raw.check_out,
        totalHours: raw.totalHours !== undefined ? raw.totalHours : raw.total_hours,
        status: raw.status,
        note: raw.note,
        createdAt: raw.createdAt || raw.created_at,
        updatedAt: raw.updatedAt || raw.updated_at,
        employee: raw.employee,
        shift: raw.shift,
        workLocation: raw.workLocation || raw.work_location,
    };
}