// ========================================
// SERVIÇO DE COMUNICAÇÃO - ANÁLISES API ||
// ========================================

/**
 * Classe responsável pela comunicação com a API de Análises
 * Segue SRP: responsável apenas por requisições HTTP relacionadas a análises
 */
class AnalisesService {
    
    /**
     * Carrega a lista de análises da API
     * @param {Function} onSuccess - Callback de sucesso
     * @param {Function} onError - Callback de erro (opcional)
     */
    static listarAnalises(onSuccess, onError) {
        $.ajax({
            url: window.API_CONFIG.ENDPOINTS.analises.listar,
            method: 'GET',
            success: function(analises) {
                if (onSuccess) {
                    onSuccess(analises);
                }
            },
            error: function(xhr) {
                if (onError) {
                    onError(xhr);
                } else {
                    window.UIUtils.tratarErroRequisicao(xhr, 'Erro ao carregar análises');
                }
            }
        });
    }

    /**
     * Cadastra uma nova análise na API
     * @param {Object} dadosAnalise - Dados da análise a ser cadastrada
     * @param {Function} onSuccess - Callback de sucesso
     * @param {Function} onError - Callback de erro (opcional)
     */
    static cadastrarAnalise(dadosAnalise, onSuccess, onError) {
        // Fail Fast: Valida antes de enviar
        if (!window.UIUtils.validarDadosAnalise(dadosAnalise)) {
            return;
        }

        $.ajax({
            url: window.API_CONFIG.ENDPOINTS.analises.cadastrar,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(dadosAnalise),
            success: function(analiseCreated) {
                window.UIUtils.exibirMensagem(
                    'Análise cadastrada com sucesso!', 
                    'success'
                );
                if (onSuccess) {
                    onSuccess(analiseCreated);
                }
            },
            error: function(xhr) {
                if (onError) {
                    onError(xhr);
                } else {
                    window.UIUtils.tratarErroRequisicao(xhr, 'Erro ao cadastrar análise');
                }
            }
        });
    }
}

// Exporta para uso global
window.AnalisesService = AnalisesService;