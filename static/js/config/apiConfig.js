// ============================
// CONFIGURAÇÃO E CONSTANTES ||
// ============================

const API_BASE_URL = 'http://localhost:8080';

const API_ENDPOINTS = {
    // Endpoints de Filmes
    filmes: {
        listar: `${API_BASE_URL}/filmes/listar`,
        cadastrar: `${API_BASE_URL}/filmes/cadastrar`,
        detalhar: (id) => `${API_BASE_URL}/filmes/detalhar/${id}`
    },
    
    // Endpoints de Análises
    analises: {
        listar: `${API_BASE_URL}/analises`,
        cadastrar: `${API_BASE_URL}/analises/cadastrar`
    }
};

// Exporta para uso global
window.API_CONFIG = {
    BASE_URL: API_BASE_URL,
    ENDPOINTS: API_ENDPOINTS
};