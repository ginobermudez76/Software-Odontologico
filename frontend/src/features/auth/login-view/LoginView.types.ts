export interface LoginViewProps {}

export interface DemoAccount {
  role: string;
  label: string;
  email: string;
  password: string;
  icon: string;
  iconColor: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'ADMIN_TI',
    label: 'Admin',
    email: 'admin@sigodental.com',
    password: 'Admin123456!',
    icon: 'shield_person',
    iconColor: '#d97706',
  },
  {
    role: 'DIRECTOR_MEDICO',
    label: 'Director',
    email: 'director@sigodental.com',
    password: 'Admin123456!',
    icon: 'clinical_notes',
    iconColor: '#0284c7',
  },
  {
    role: 'ODONTOLOGO',
    label: 'Odontólogo',
    email: 'odontologo@sigodental.com',
    password: 'Admin123456!',
    icon: 'dentistry',
    iconColor: '#0d9488',
  },
  {
    role: 'RECEPCIONISTA',
    label: 'Recepción',
    email: 'recepcion@sigodental.com',
    password: 'Admin123456!',
    icon: 'support_agent',
    iconColor: '#7c3aed',
  },
  {
    role: 'CAJERO',
    label: 'Cajero',
    email: 'cajero@sigodental.com',
    password: 'Admin123456!',
    icon: 'point_of_sale',
    iconColor: '#059669',
  },
];
