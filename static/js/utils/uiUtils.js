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
            $('.alert-custom').fadeOut(500, function () {
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

    // ========================================
    // GERENCIAMENTO DE TEMA (DARK/LIGHT MODE)
    // ========================================

    /**
     * Salva preferência de tema no backend (cookie)
     * @param {string} tema - Tema a ser salvo ('light' ou 'dark')
     * @param {Function} onSuccess - Callback de sucesso
     * @param {Function} onError - Callback de erro
     */
    static salvarTema(tema, onSuccess, onError) {
        $.ajax({
            url: window.API_CONFIG.ENDPOINTS.theme.set,
            method: 'POST',
            data: { tema: tema },
            xhrFields: {
                withCredentials: true  // IMPORTANTE: Envia cookies cross-origin
            },
            success: function (response) {
                // Tema salvo com sucesso
                if (onSuccess) {
                    onSuccess(response);
                }
            },
            error: function (xhr) {
                console.error('❌ Erro ao salvar tema:', xhr);
                if (onError) {
                    onError(xhr);
                } else {
                    UIUtils.tratarErroRequisicao(xhr, 'Erro ao salvar tema');
                }
            }
        });
    }

    /**
     * Carrega tema salvo do backend (cookie)
     */
    static carregarTema() {
        $.ajax({
            url: window.API_CONFIG.ENDPOINTS.theme.get,
            method: 'GET',
            xhrFields: {
                withCredentials: true  // IMPORTANTE: Envia cookies cross-origin
            },
            success: function (response) {
                // O backend retorna { tema: 'dark' } ou apenas 'dark'
                const tema = response.tema || response || 'light';
                UIUtils.aplicarTema(tema);
                UIUtils.atualizarBotoesTema(tema);
            },
            error: function (xhr) {
                // Se falhar, aplica tema padrão
                UIUtils.aplicarTema('light');
                UIUtils.atualizarBotoesTema('light');
            }
        });
    }

    /**
     * Aplica tema no Bootstrap e no HTML
     * @param {string} tema - Tema a ser aplicado ('light' ou 'dark')
     */
    static aplicarTema(tema) {
        $('html').attr('data-bs-theme', tema);
    }

    /**
     * Atualiza visibilidade dos botões de tema
     * @param {string} tema - Tema atual ('light' ou 'dark')
     */
    static atualizarBotoesTema(tema) {
        const btnDark = $('#dark');
        const btnLight = $('#light');

        if (tema === 'dark') {
            // Se está no modo dark, mostra botão light (sol) e esconde dark (lua)
            btnDark.addClass('d-none');
            btnLight.removeClass('d-none');
        } else {
            // Se está no modo light, mostra botão dark (lua) e esconde light (sol)
            btnDark.removeClass('d-none');
            btnLight.addClass('d-none');
        }
    }

    /**
     * Alterna entre tema claro e escuro
     */
    static alternarTema() {
        const temaAtual = $('html').attr('data-bs-theme') || 'light';
        const novoTema = temaAtual === 'light' ? 'dark' : 'light';

        // Aplica o novo tema
        this.aplicarTema(novoTema);
        
        // Atualiza os botões
        this.atualizarBotoesTema(novoTema);
        
        // Salva no backend (cookie)
        this.salvarTema(novoTema);
    }

    /**
     * Inicializa os event listeners dos botões de tema
     * Usa FLAG para evitar inicialização duplicada
     */
    static inicializarTema() {
        // Verifica se já foi inicializado se for o caso pula a inicialização
        if (window._temaInicializado) {
            return;
        }

        // Inicializa o sistema de temas
        
        // Remove event listeners antigos antes de adicionar novos
        $(document).off('click', '#dark');
        $(document).off('click', '#light');
        
        // DELEGAÇÃO DE EVENTOS: Escuta cliques no document dark/light
        $(document).on('click', '#dark', function(e) {
            e.preventDefault();
            e.stopPropagation(); // Previne propagação
            UIUtils.alternarTema();
        });

        $(document).on('click', '#light', function(e) {
            e.preventDefault();
            e.stopPropagation(); // Aqui também
            UIUtils.alternarTema();
        });

        // Carrega tema salvo ao iniciar
        UIUtils.carregarTema();
        
        // Marca como inicializado
        window._temaInicializado = true;
    }
}

// Exporta para uso global
window.UIUtils = UIUtils;