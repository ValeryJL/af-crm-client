import apiClient from './client';

export interface ClientDto {
    id?: number;
    razonSocial: string;
    cuitRut?: string;
    condicionFiscal?: string;
    direccionFiscal?: string;
    telefonoGeneral?: string;
    emailComercial?: string;
    notas?: string;
    activo?: boolean;
    totalServicios?: number;
    totalEquipos?: number;
    contacts?: ContactDto[];
}

export interface ContactDto {
    id?: number;
    nombre: string;
    cargo?: string;
    telefono?: string;
    email?: string;
    notas?: string;
    clientId?: number;
    serviceId?: number;
}

export interface ServiceDto {
    id?: number;
    nombre: string;
    direccionFisica: string;
    localidad?: string;
    provincia?: string;
    frecuenciaVisita: 'SEMANAL' | 'QUINCENAL' | 'MENSUAL' | 'BIMESTRAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL' | 'A_DEMANDA';
    diasAvisoAlerta?: number;
    fechaUltimaVisita?: string;
    fechaProximaVisitaLimite?: string;
    notas?: string;
    activo?: boolean;
    clientId: number;
    clientRazonSocial?: string;
    totalEquipos?: number;
    slaStatus?: 'OVERDUE' | 'UPCOMING' | 'ON_TIME';
    diasParaVisita?: number;
    equipments?: EquipmentDto[];
    contacts?: ContactDto[];
}

export interface EquipmentPartDto {
    id?: number;
    nombreParte: string;
    codigoRepuesto?: string;
    fechaUltimoCambio?: string;
    vidaUtilMeses?: number;
    vidaUtilHoras?: number;
    alertaTempranaDias?: number;
    notas?: string;
    equipmentId?: number;
    equipmentNombre?: string;
    fechaVencimientoEstimada?: string;
    vencido?: boolean;
}

export interface EquipmentDto {
    id?: number;
    nombre: string;
    marca?: string;
    modelo?: string;
    numeroSerie?: string;
    ubicacion?: string;
    horometroActual?: number;
    periodicidadRegular?: string; // SEMANAL, QUINCENAL, MENSUAL, BIMESTRAL, TRIMESTRAL, SEMESTRAL, ANUAL, HORAS, NINGUNA
    intervaloHorasRegular?: number; // e.g. 250
    fechaUltimaVisitaRegular?: string;
    fechaProximaVisitaRegular?: string;
    periodicidadServiceMayor?: string; // ANUAL, BIANUAL, HORAS, NINGUNA
    intervaloHorasService?: number; // e.g. 1000
    fechaUltimoServiceMayor?: string;
    fechaProximoServiceMayor?: string;
    specs?: Record<string, any>;
    notas?: string;
    activo?: boolean;
    serviceId: number;
    serviceNombre?: string;
    clientRazonSocial?: string;
    parts?: EquipmentPartDto[];
}

export interface WorkOrderDto {
    id?: number;
    numeroOt?: string;
    tipo: 'PREVENTIVO' | 'CORRECTIVO' | 'SERVICE_MAYOR' | 'INSPECCION';
    estado: 'PENDIENTE' | 'ASIGNADA' | 'EN_CURSO' | 'COMPLETADA' | 'CANCELADA';
    fechaProgramada?: string;
    fechaInicioReal?: string;
    fechaFinalizacion?: string;
    descripcion?: string;
    serviceId: number;
    serviceNombre?: string;
    clientRazonSocial?: string;
    direccionFisica?: string;
    tecnicoId?: number;
    tecnicoNombre?: string;
    formDataReporte?: Record<string, any>;
    partesReemplazadas?: Record<string, any>;
    firmaClienteNombre?: string;
    firmaClienteDni?: string;
    observacionesCierre?: string;
}

export interface SlaAlertDto {
    tipo: 'CRITICAL_OVERDUE' | 'UPCOMING_SLA' | 'CONSUMABLE_EXPIRED';
    severidad: 'RED' | 'YELLOW' | 'ORANGE';
    titulo: string;
    descripcion: string;
    clientId?: number;
    clientRazonSocial?: string;
    serviceId?: number;
    serviceNombre?: string;
    equipmentId?: number;
    equipmentNombre?: string;
    fechaLimite?: string;
    diasDiferencia?: number;
    accionSugerida?: string;
}

// API Methods
export const crmApi = {
    // Clients
    getClients: () => apiClient.get<ClientDto[]>('/clients'),
    getClientById: (id: number) => apiClient.get<ClientDto>(`/clients/${id}`),
    createClient: (client: ClientDto) => apiClient.post<ClientDto>('/clients', client),
    updateClient: (id: number, client: ClientDto) => apiClient.put<ClientDto>(`/clients/${id}`, client),
    deleteClient: (id: number) => apiClient.delete(`/clients/${id}`),

    // Services
    getServices: () => apiClient.get<ServiceDto[]>('/services'),
    getServicesByClient: (clientId: number) => apiClient.get<ServiceDto[]>(`/services/client/${clientId}`),
    getServiceById: (id: number) => apiClient.get<ServiceDto>(`/services/${id}`),
    createService: (service: ServiceDto) => apiClient.post<ServiceDto>('/services', service),
    updateService: (id: number, service: ServiceDto) => apiClient.put<ServiceDto>(`/services/${id}`, service),

    // Equipments
    getEquipments: () => apiClient.get<EquipmentDto[]>('/equipments'),
    getEquipmentsByService: (serviceId: number) => apiClient.get<EquipmentDto[]>(`/equipments/service/${serviceId}`),
    getEquipmentById: (id: number) => apiClient.get<EquipmentDto>(`/equipments/${id}`),
    createEquipment: (eq: EquipmentDto) => apiClient.post<EquipmentDto>('/equipments', eq),
    updateEquipment: (id: number, eq: EquipmentDto) => apiClient.put<EquipmentDto>(`/equipments/${id}`, eq),
    addPart: (eqId: number, part: EquipmentPartDto) => apiClient.post<EquipmentPartDto>(`/equipments/${eqId}/parts`, part),
    deletePart: (partId: number) => apiClient.delete(`/equipments/parts/${partId}`),

    // Work Orders
    getWorkOrders: () => apiClient.get<WorkOrderDto[]>('/work-orders'),
    getWorkOrdersByService: (serviceId: number) => apiClient.get<WorkOrderDto[]>(`/work-orders/service/${serviceId}`),
    getWorkOrderById: (id: number) => apiClient.get<WorkOrderDto>(`/work-orders/${id}`),
    createWorkOrder: (wo: WorkOrderDto) => apiClient.post<WorkOrderDto>('/work-orders', wo),
    updateWorkOrder: (id: number, wo: Partial<WorkOrderDto>) => apiClient.put<WorkOrderDto>(`/work-orders/${id}`, wo),
    scheduleWorkOrder: (id: number, fechaProgramada?: string, tecnicoId?: number) => {
        const params = new URLSearchParams();
        if (fechaProgramada) params.append('fechaProgramada', fechaProgramada);
        if (tecnicoId) params.append('tecnicoId', tecnicoId.toString());
        return apiClient.patch<WorkOrderDto>(`/work-orders/${id}/schedule?${params.toString()}`);
    },
    updateWorkOrderStatus: (id: number, status: string) => apiClient.patch<WorkOrderDto>(`/work-orders/${id}/status?status=${status}`),
    completeWorkOrder: (id: number, closeData: Partial<WorkOrderDto>) => apiClient.post<WorkOrderDto>(`/work-orders/${id}/complete`, closeData),
    deleteWorkOrder: (id: number) => apiClient.delete(`/work-orders/${id}`),

    // Users / Technicians
    getUsers: () => apiClient.get<any[]>('/users'),

    // Alerts
    getAlerts: () => apiClient.get<SlaAlertDto[]>('/alerts'),
};
