// =================================
// UTILITÁRIOS DE INTERFACE (UI) ||
// =================================

/**
 * Classe responsável por utilitários de UI
 * Segue SRP: responsável apenas por feedback visual e validações
 */
class UIUtils {
    
    /**
     * Exibe mensagem de feedback ao usuário
     * @param {string} mensagem - Mensagem a ser exibida
     * @param {string} tipo - Tipo da mensagem (success, danger, warning, info)
     */
    static exibirMensagem(mensagem, tipo = 'info') {
        // Remove alertas anteriores
        $('.alert-custom').remove();

        const alerta = `
            <div class="alert alert-${tipo} alert-dismissible fade show alert-custom" role="alert">
                <i class="bi bi-${this.obterIconeAlerta(tipo)} me-2"></i>
                ${mensagem}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;

        // Insere o alerta no topo do container
        const container = $('#content-container .container').first();
        if (container.length > 0) {
            container.prepend(alerta);
        } else {
            $('#content-container').prepend(alerta);
        }

        // Auto-remove após 5 segundos
        setTimeout(() => {
            $('.alert-custom').fadeOut(500, function() {
                $(this).remove();
            });
        }, 5000);
    }

    /**
     * Retorna o ícone apropriado para o tipo de alerta
     * @param {string} tipo - Tipo do alerta
     * @returns {string} Nome do ícone Bootstrap
     */
    static obterIconeAlerta(tipo) {
        const icones = {
            success: 'check-circle-fill',
            danger: 'exclamation-triangle-fill',
            warning: 'exclamation-circle-fill',
            info: 'info-circle-fill'
        };
        return icones[tipo] || 'info-circle-fill';
    }

    /**
     * Trata erros de requisições AJAX
     * @param {Object} xhr - Objeto XMLHttpRequest
     * @param {string} mensagemPadrao - Mensagem padrão de erro
     */
    static tratarErroRequisicao(xhr, mensagemPadrao) {
        let mensagemErro = mensagemPadrao;

        // Tenta extrair mensagem de erro da resposta usando optional chaining
        if (xhr?.responseJSON?.message) {
            mensagemErro += `: ${xhr.responseJSON.message}`;
        } else if (xhr.status === 0) {
            mensagemErro = 'Erro de conexão. Verifique se a API está rodando.';
        } else if (xhr.status === 404) {
            mensagemErro = 'Recurso não encontrado.';
        } else if (xhr.status === 500) {
            mensagemErro = 'Erro interno do servidor.';
        }

        this.exibirMensagem(mensagemErro, 'danger');
        console.error('Erro na requisição:', xhr);
    }

    /**
     * Abrevia um texto longo
     * @param {string} texto - Texto a ser abreviado
     * @param {number} maxCaracteres - Número máximo de caracteres (padrão: 100)
     * @returns {string} Texto abreviado com reticências
     */
    static abreviarTexto(texto, maxCaracteres = 100) {
        if (!texto || texto.length <= maxCaracteres) {
            return texto;
        }
        return texto.substring(0, maxCaracteres).trim() + '...';
    }

    /**
     * Renderiza estrelas de avaliação
     * @param {number} nota - Nota de 1 a 5
     * @returns {string} HTML das estrelas
     */
    static renderEstrelas(nota) {
        let estrelas = '';
        for (let i = 1; i <= 5; i++) {
            const icone = i <= nota ? 'bi-star-fill' : 'bi-star';
            estrelas += `<i class="bi ${icone}"></i> `;
        }
        return estrelas;
    }

    /**
     * Cria mensagem de estado vazio
     * @param {string} mensagem - Mensagem a ser exibida
     * @returns {string} HTML da mensagem
     */
    static criarMensagemVazia(mensagem) {
        return `
            <p class="d-flex justify-content-center text-muted fst-italic">
                ${mensagem}
            </p>
        `;
    }

    /**
     * Valida os dados do formulário de filme
     * @param {Object} dados - Dados a serem validados
     * @returns {boolean} True se válido, false caso contrário
     */
    static validarDadosFilme(dados) {
        // Fail Fast: Validação de campos obrigatórios
        if (!dados.titulo || !dados.sinopse || !dados.genero || !dados.anoLancamento) {
            this.exibirMensagem('Todos os campos são obrigatórios!', 'warning');
            return false;
        }

        // Validação do ano
        const ano = parseInt(dados.anoLancamento);
        if (isNaN(ano) || ano < 1800 || ano > new Date().getFullYear() + 5) {
            this.exibirMensagem('Ano de lançamento inválido!', 'warning');
            return false;
        }

        return true;
    }

    /**
     * Valida os dados do formulário de análise
     * @param {Object} dados - Dados a serem validados
     * @returns {boolean} True se válido, false caso contrário
     */
    static validarDadosAnalise(dados) {
        // Fail Fast: Validação de campos obrigatórios
        if (!dados.filmeId || !dados.filmeAnalise || !dados.nota) {
            this.exibirMensagem('Todos os campos são obrigatórios!', 'warning');
            return false;
        }

        // Validação da nota
        const nota = parseInt(dados.nota);
        if (isNaN(nota) || nota < 1 || nota > 5) {
            this.exibirMensagem('A nota deve ser entre 1 e 5!', 'warning');
            return false;
        }

        return true;
    }
}

// Exporta para uso global
window.UIUtils = UIUtils;