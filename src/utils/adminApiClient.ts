import { AdminRole, AdminUser } from '../types/admin';

class AdminApiClient {
  private activeRole: AdminRole = 'SUPER_ADMIN';
  private activeUser: AdminUser | null = null;
  private sessionToken: string | null = null;
  private sessionPromise: Promise<string | null> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.sessionToken = localStorage.getItem('qcom_admin_session_token');
    }
  }

  public async ensureSession(): Promise<string | null> {
    const savedToken = this.sessionToken || (typeof window !== 'undefined' ? localStorage.getItem('qcom_admin_session_token') : null);
    if (savedToken) {
      this.sessionToken = savedToken;
      return savedToken;
    }

    if (!this.sessionPromise) {
      this.sessionPromise = (async () => {
        try {
          const res = await fetch('/api/admin/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              employeeId: this.activeUser?.id || (typeof window !== 'undefined' ? localStorage.getItem('qcom_active_admin_id') : null) || 'emp-001',
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.sessionToken) {
              this.setSessionToken(data.sessionToken);
              return data.sessionToken;
            }
          }
        } catch {
          // offline fallback
        } finally {
          this.sessionPromise = null;
        }
        return null;
      })();
    }
    return this.sessionPromise;
  }

  public async setPersona(user: AdminUser) {
    this.activeUser = user;
    this.activeRole = user.role;
    if (typeof window !== 'undefined') {
      localStorage.setItem('qcom_active_admin_role', user.role);
      localStorage.setItem('qcom_active_admin_id', user.id);
    }

    await this.ensureSession();

    // Handshake with server to acquire cryptographic session token for this persona
    try {
      const res = await fetch('/api/admin/auth/switch-persona', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ employeeId: user.id, roleCode: user.role }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.sessionToken) {
          this.setSessionToken(data.sessionToken);
        }
      }
    } catch {
      // Graceful fallback for offline/transient state
    }
  }

  public setSessionToken(token: string) {
    this.sessionToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('qcom_admin_session_token', token);
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
    
    const savedToken = this.sessionToken || (typeof window !== 'undefined' ? localStorage.getItem('qcom_admin_session_token') : null);
    if (savedToken) {
      headers['Authorization'] = `Bearer ${savedToken}`;
      headers['x-admin-session-token'] = savedToken;
    }

    if (this.activeUser) {
      headers['x-admin-id'] = this.activeUser.id;
    } else if (typeof window !== 'undefined') {
      const savedId = localStorage.getItem('qcom_active_admin_id');
      if (savedId) headers['x-admin-id'] = savedId;
    }
    return headers;
  }

  private handleResponseHeaders(res: Response) {
    const freshToken = res.headers.get('x-admin-session-token');
    if (freshToken && freshToken !== this.sessionToken) {
      this.setSessionToken(freshToken);
    }
  }

  public async get<T>(endpoint: string): Promise<T> {
    await this.ensureSession();
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    this.handleResponseHeaders(res);
    
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
    await this.ensureSession();
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    this.handleResponseHeaders(res);

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

  public async put<T>(endpoint: string, body: any): Promise<T> {
    await this.ensureSession();
    const res = await fetch(endpoint, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    this.handleResponseHeaders(res);

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

  public async patch<T>(endpoint: string, body?: any): Promise<T> {
    await this.ensureSession();
    const res = await fetch(endpoint, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    this.handleResponseHeaders(res);

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

  public async delete<T>(endpoint: string): Promise<T> {
    await this.ensureSession();
    const res = await fetch(endpoint, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    this.handleResponseHeaders(res);

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
