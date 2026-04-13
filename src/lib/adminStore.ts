export interface LocalAdminRecord {
    email: string;
    name: string;
}

const LOCAL_STORAGE_KEY = 'sunday-school-admins';

export function getLocalAdmins(): LocalAdminRecord[] {
    if (typeof window === 'undefined') {
        return [];
    }

    try {
        const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!stored) return [];
        return JSON.parse(stored) as LocalAdminRecord[];
    } catch (error) {
        console.warn('Failed to read local admin records:', error);
        return [];
    }
}

export function saveLocalAdmin(admin: LocalAdminRecord): LocalAdminRecord[] {
    const admins = getLocalAdmins();
    const normalizedEmail = admin.email.trim().toLowerCase();
    const existing = admins.filter((item) => item.email.trim().toLowerCase() !== normalizedEmail);
    const updated = [...existing, { ...admin, email: normalizedEmail }];
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return updated;
}

export function removeLocalAdmin(email: string): LocalAdminRecord[] {
    const normalizedEmail = email.trim().toLowerCase();
    const admins = getLocalAdmins().filter((admin) => admin.email.trim().toLowerCase() !== normalizedEmail);
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(admins));
    return admins;
}

export function findLocalAdminByEmail(email: string): LocalAdminRecord | undefined {
    const normalizedEmail = email?.trim().toLowerCase();
    return getLocalAdmins().find((admin) => admin.email.trim().toLowerCase() === normalizedEmail);
}
