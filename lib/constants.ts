export const CATEGORIES = ['SUPPORT', 'GOOGLE_ADS', 'WEBSITE'] as const
export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const
export const STATUSES = ['NEW', 'PENDING', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'CANCELLED'] as const
export const LABELS: Record<string, string> = {
  SUPPORT: 'Soporte', GOOGLE_ADS: 'Google Ads', WEBSITE: 'Sitio web', LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta', URGENT: 'Urgente',
  NEW: 'Nuevo', PENDING: 'Pendiente', IN_PROGRESS: 'En proceso', IN_REVIEW: 'En revisión', COMPLETED: 'Completado', CANCELLED: 'Cancelado',
  ADMIN: 'Administrador', COLLABORATOR: 'Colaborador', READ_ONLY: 'Solo lectura', DESKTOP: 'Escritorio', EMAIL: 'Email', BOTH: 'Ambos'
}
export const MAX_FILE_SIZE = 15 * 1024 * 1024
export const ALLOWED_EXTENSIONS = ['jpg','jpeg','png','gif','webp','pdf','doc','docx','xls','xlsx','csv','zip','txt','ppt','pptx']
