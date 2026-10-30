export interface NavigationOption {
  id: string;
  parentId?: string | null;
  optionCode: string;
  title: string;
  frontendRoute: string;
  materialIcon: string;
  orderIndex: number;
  lectura: boolean;
  escritura: boolean;
  borrado: boolean;
}

export interface ActionPermissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  branchId: string;
  branchName: string;
}

