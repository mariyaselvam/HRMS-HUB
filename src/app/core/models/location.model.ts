export interface Cluster {
    id: string;
    companyId: string;
    name: string;
    code?: string | null;
    state?: string | null;
    createdAt?: string;
    updatedAt?: string;
    workLocations?: WorkLocation[];
    _count?: {
        workLocations?: number;
        users?: number;
        holidays?: number;
    };
}

export interface WorkLocation {
    id: string;
    name: string;
    address?: string;
    companyId: string;
    clusterId?: string | null;
    cluster?: {
        id: string;
        name: string;
        code?: string | null;
        state?: string | null;
    } | null;
    latitude?: number;
    longitude?: number;
    createdAt: string;
    _count?: {
        employees: number;
    };
}

export interface WorkLocationState {
    locations: WorkLocation[];
    loading: boolean;
    error: string | null;
}

