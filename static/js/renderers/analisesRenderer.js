// ============================================
// RENDERIZAÇÃO E CONTROLE - TELA ANÁLISES ||
// ============================================

/**
 * Classe responsável pela renderização e controle da tela de análises
 * Segue SRP: responsável apenas pela interface de análises
 */
class AnalisesRenderer {
    
    constructor() {
        this.inicializado = false;
    }

    /**
     * Renderiza a lista de análises
     * @param {Array} analises - Lista de análises
     */
    renderAnalises(analises) {
        const container = $('#analises-container');
        container.empty();

        // Fail Fast: Verifica se há análises
        if (!analises || analises.length === 0) {
            container.html(window.UIUtils.criarMensagemVazia('Ainda não há análises cadastradas.'));
            return;
        }

        analises.forEach(analise => container.append(this.criarCardAnalise(analise)));
    }

    /**
     * Cria um card de análise
     * @param {Object} analise - Objeto contendo dados da análise
     * @returns {string} HTML do card
     */
    criarCardAnalise(analise) {
        const tituloFilme = analise?.filme?.titulo || 'Filme não encontrado';
        return `
            <div class="card mb-3">
                <div class="card-header d-flex justify-content-between">
                    <strong>${tituloFilme}</strong>
                    <span class="text-warning">
                        ${window.UIUtils.renderEstrelas(analise.nota)}
                    </span>
                </div>
                <div class="card-body">
                    <p class="card-text">"${analise.filmeAnalise}"</p>
                    <footer class="blockquote-footer">
                        Análise de <cite title="Source Title">Usuário Anônimo</cite>
                    </footer>
                </div>
            </div>
        `;
    }

    /**
     * Limpa o formulário de análise
     */
    limparFormulario() {
        const form = $('#analise-form');
        if (form.length > 0) {
            form[0].reset();
            // Desmarca todos os radio buttons de nota
            $('input[name="nota"]').prop('checked', false);
        }
    }

    /**
     * Coleta dados do formulário de análise
     * @returns {Object} Objeto com dados do formulário
     */
    coletarDadosFormulario() {
        const filmeId = $('#filmeSelect').val();
        const analiseTexto = $('#analiseTexto').val();
        const nota = $('input[name="nota"]:checked').val();

        return {
            filmeId: filmeId,
            filmeAnalise: analiseTexto ? analiseTexto.trim() : '',
            nota: nota
        };
    }

    /**
     * Carrega análises e atualiza a interface
     */
    carregarAnalises() {
        const self = this;
        window.AnalisesService.listarAnalises(
            function(analises) {
                self.renderAnalises(analises);
            }
        );
    }

    /**
     * Cadastra uma análise e atualiza a interface
     */
    cadastrarAnalise() {
        const self = this;
        const dadosAnalise = this.coletarDadosFormulario();
        
        window.AnalisesService.cadastrarAnalise(
            dadosAnalise,
            function() {
                self.limparFormulario();
                self.carregarAnalises();
            }
        );
    }

    /**
     * Inicializa a página de análises
     */
    inicializar() {
        // Previne múltiplas inicializações
        if (this.inicializado) {
            return;
        }
        
        // Verifica se os elementos existem antes de inicializar
        if ($('#analises-container').length === 0) {
            return;
        }
        
        this.inicializado = true;
        const self = this;
        
        // Carrega análises ao iniciar a página
        this.carregarAnalises();
        
        // Carrega filmes para popular o select
        window.FilmesService.listarFilmes(
            function(filmes) {
                self.popularSelectFilmes(filmes);
            }
        );

        // Remove event listeners antigos para evitar duplicação
        $('#analise-form').off('submit');

        // Submit do formulário de cadastro
        $('#analise-form').on('submit', function(e) {
            e.preventDefault();
            self.cadastrarAnalise();
        });
    }

    /**
     * Popula o select de filmes
     * @param {Array} filmes - Lista de filmes
     */
    popularSelectFilmes(filmes) {
        const select = $('#filmeSelect');
        
        // Fail Fast: Verifica se o select existe
        if (select.length === 0) {
            return;
        }
        
        select.find('option:not(:first)').remove();

        // Fail Fast: Verifica se há filmes
        if (!filmes || filmes.length === 0) {
            return;
        }

        filmes.forEach(filme => {
            select.append(`<option value="${filme.id}">${filme.titulo}</option>`);
        });
    }

    /**
     * Reseta o estado de inicialização
     */
    resetar() {
        this.inicializado = false;
    }
}

// Cria instância global
window.analisesRenderer = new AnalisesRenderer();

// ==================
// EVENT LISTENERS ||
// ==================

// Verifica periodicamente se a página de análises foi carregada
setInterval(function() {
    // Se estiver na página de análises e ainda não foi inicializada
    if (window.currentPage === 'analises' && $('#analises-container').length > 0) {
        window.analisesRenderer.inicializar();
    }
    // Se não estiver na página de análises, reseta o estado
    else if (window.currentPage !== 'analises' && window.analisesRenderer.inicializado) {
        window.analisesRenderer.resetar();
    }
}, 500);

// Inicialização quando o jQuery estiver pronto
$(document).ready(function() {
    // Tenta inicializar se já estiver na página de análises
    if ($('#analises-container').length > 0) {
        window.analisesRenderer.inicializar();
    }
});