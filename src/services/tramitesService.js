// Configuración base de la API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class TramitesService {
    // Obtener tipos de trámites
    static async obtenerTiposTramites() {
        try {
            const response = await fetch(`${API_BASE_URL}/tramites/tipos`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Agregar token de autenticación si es necesario
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error al obtener tipos de trámites:', error);
            throw error;
        }
    }

    // Crear nuevo trámite
    static async crearTramite(tramiteData) {
        try {
            const response = await fetch(`${API_BASE_URL}/tramites`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Agregar token de autenticación si es necesario
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(tramiteData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error al crear trámite:', error);
            throw error;
        }
    }

    // Obtener trámites de un usuario
    static async obtenerTramitesPorUsuario(idUsuario) {
        try {
            const response = await fetch(`${API_BASE_URL}/tramites/usuario/${idUsuario}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error al obtener trámites:', error);
            throw error;
        }
    }

    // Actualizar estado de trámite
    static async actualizarEstadoTramite(idTramite, estado) {
        try {
            const response = await fetch(`${API_BASE_URL}/tramites/${idTramite}/estado`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ estado })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            throw error;
        }
    }
}

export default TramitesService;