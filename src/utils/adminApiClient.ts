import { AdminRole, AdminUser } from '../types/admin';

class AdminApiClient {
  private activeRole: AdminRole = 'SUPER_ADMIN';
  private activeUser: AdminUser | null = null;

  public setPersona(user: AdminUser) {
    this.activeUser = user;
    this.activeRole = user.role;
    if (typeof window !== 'undefined') {
      localStorage.setItem('qcom_active_admin_role', user.role);
      localStorage.setItem('qcom_active_admin_id', user.id);
    }
  }

  public setAdminRole(role: AdminRole) {
    this.activeRole = role;
    if (typeof window !== 'undefined') {
      localStorage.setItem('qcom_active_admin_role', role);
    }
  }

  public setAdminId(id: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('qcom_active_admin_id', id);
    }
  }

  public getActiveRole(): AdminRole {
    if (typeof window !== 'undefined' && !this.activeUser) {
      const saved = localStorage.getItem('qcom_active_admin_role') as AdminRole;
      if (saved) this.activeRole = saved;
    }
    return this.activeRole;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-admin-role': this.getActiveRole(),
    };
    if (this.activeUser) {
      headers['x-admin-id'] = this.activeUser.id;
    } else if (typeof window !== 'undefined') {
      const savedId = localStorage.getItem('qcom_active_admin_id');
      if (savedId) headers['x-admin-id'] = savedId;
    }
    return headers;
  }

  public async get<T>(endpoint: string): Promise<T> {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: Server returned non-JSON response`);
      }
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        throw new Error(`Endpoint ${endpoint} returned invalid JSON format`);
      }
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || `HTTP Error ${res.status}`);
    }
    return data;
  }

  public async post<T>(endpoint: string, body: any): Promise<T> {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: Server returned non-JSON response`);
      }
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        throw new Error(`Endpoint ${endpoint} returned invalid JSON format`);
      }
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || `HTTP Error ${res.status}`);
    }
    return data;
  }
}

export const adminApi = new AdminApiClient();
