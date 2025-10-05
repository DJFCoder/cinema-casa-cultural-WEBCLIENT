// ======================================
// SERVIÇO DE COMUNICAÇÃO - FILMES API ||
// ======================================

/**
 * Classe responsável pela comunicação com a API de Filmes
 * Segue SRP: responsável apenas por requisições HTTP relacionadas a filmes
 */
class FilmesService {
    
    /**
     * Carrega a lista de filmes da API
     * @param {Function} onSuccess - Callback de sucesso
     * @param {Function} onError - Callback de erro (opcional)
     */
    static listarFilmes(onSuccess, onError) {
        $.ajax({
            url: window.API_CONFIG.ENDPOINTS.filmes.listar,
            method: 'GET',
            success: function(filmes) {
                if (onSuccess) {
                    onSuccess(filmes);
                }
            },
            error: function(xhr) {
                if (onError) {
                    onError(xhr);
                } else {
                    window.UIUtils.tratarErroRequisicao(xhr, 'Erro ao carregar filmes');
                }
            }
        });
    }

    /**
     * Cadastra um novo filme na API
     * @param {Object} dadosFilme - Dados do filme a ser cadastrado
     * @param {Function} onSuccess - Callback de sucesso
     * @param {Function} onError - Callback de erro (opcional)
     */
    static cadastrarFilme(dadosFilme, onSuccess, onError) {
        // Fail Fast: Valida antes de enviar
        if (!window.UIUtils.validarDadosFilme(dadosFilme)) {
            return;
        }

        $.ajax({
            url: window.API_CONFIG.ENDPOINTS.filmes.cadastrar,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(dadosFilme),
            success: function(filmeCreated) {
                window.UIUtils.exibirMensagem(
                    `Filme "${filmeCreated.titulo}" cadastrado com sucesso!`, 
                    'success'
                );
                if (onSuccess) {
                    onSuccess(filmeCreated);
                }
            },
            error: function(xhr) {
                if (onError) {
                    onError(xhr);
                } else {
                    window.UIUtils.tratarErroRequisicao(xhr, 'Erro ao cadastrar filme');
                }
            }
        });
    }

    /**
     * Busca detalhes de um filme específico
     * @param {number} filmeId - ID do filme
     * @param {Function} onSuccess - Callback de sucesso
     * @param {Function} onError - Callback de erro (opcional)
     */
    static detalharFilme(filmeId, onSuccess, onError) {
        $.ajax({
            url: window.API_CONFIG.ENDPOINTS.filmes.detalhar(filmeId),
            method: 'GET',
            success: function(filme) {
                if (onSuccess) {
                    onSuccess(filme);
                }
            },
            error: function(xhr) {
                if (onError) {
                    onError(xhr);
                } else {
                    window.UIUtils.tratarErroRequisicao(xhr, 'Erro ao buscar detalhes do filme');
                }
            }
        });
    }
}

// Exporta para uso global
window.FilmesService = FilmesService;