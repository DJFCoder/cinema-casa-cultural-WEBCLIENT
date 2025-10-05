// ========================================
// RENDERIZAÇÃO E CONTROLE - TELA FILMES ||
// ========================================

/**
 * Classe responsável pela renderização e controle da tela de filmes
 * Segue SRP: responsável apenas pela interface de filmes
 */
class FilmesRenderer {
    
    constructor() {
        this.inicializado = false;
    }

    /**
     * Renderiza a lista de filmes na tabela
     * @param {Array} filmes - Lista de filmes a serem renderizados
     */
    renderFilmes(filmes) {
        const tbody = $('#filmes-tbody');
        const vazioDiv = $('#filmes-vazio');
        const table = $('#filmes-table');

        tbody.empty();

        // Fail Fast: Verifica se há filmes antes de processar
        if (!filmes || filmes.length === 0) {
            this.exibirEstadoVazio(vazioDiv, table);
            return;
        }

        this.exibirTabela(vazioDiv, table);
        filmes.forEach(filme => tbody.append(this.criarLinhaFilme(filme)));
    }

    /**
     * Cria uma linha da tabela para um filme
     * @param {Object} filme - Objeto contendo dados do filme
     * @returns {string} HTML da linha da tabela
     */
    criarLinhaFilme(filme) {
        return `
            <tr>
                <td>${filme.id}</td>
                <td>${filme.titulo}</td>
                <td>${window.UIUtils.abreviarTexto(filme.sinopse, 50)}</td>
                <td>${filme.genero}</td>
                <td>${filme.anoLancamento}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-secondary btn-visualizar"
                            data-id="${filme.id}"
                            title="Visualizar Detalhes">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    }

    /**
     * Exibe o estado vazio (sem filmes)
     */
    exibirEstadoVazio(vazioDiv, table) {
        vazioDiv.removeClass('d-none');
        table.addClass('d-none');
    }

    /**
     * Exibe a tabela de filmes
     */
    exibirTabela(vazioDiv, table) {
        vazioDiv.addClass('d-none');
        table.removeClass('d-none');
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
     * Limpa o formulário de filme
     */
    limparFormulario() {
        const form = $('#filme-form');
        if (form.length > 0) {
            form[0].reset();
            $('#filme-id').val('');
            $('#filme-titulo').text('Cadastrar Novo Filme');
        }
    }

    /**
     * Coleta dados do formulário
     * @returns {Object} Objeto com dados do formulário
     */
    coletarDadosFormulario() {
        return {
            titulo: $('#titulo').val().trim(),
            sinopse: $('#sinopse').val().trim(),
            genero: $('#genero').val().trim(),
            anoLancamento: $('#anoLancamento').val().trim()
        };
    }

    /**
     * Exibe detalhes do filme em um modal
     * @param {Object} filme - Objeto contendo dados do filme
     */
    exibirDetalhesFilme(filme) {
        const detalhes = `
            <div class="modal fade" id="detalhesFilmeModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${filme.titulo}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p><strong>ID:</strong> ${filme.id}</p>
                            <p><strong>Gênero:</strong> ${filme.genero}</p>
                            <p><strong>Ano de Lançamento:</strong> ${filme.anoLancamento}</p>
                            <p><strong>Sinopse:</strong></p>
                            <p>${filme.sinopse}</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove modal anterior se existir
        $('#detalhesFilmeModal').remove();
        
        // Adiciona e exibe o novo modal
        $('body').append(detalhes);
        
        // Usa Bootstrap 5 para mostrar o modal
        const modalElement = document.getElementById('detalhesFilmeModal');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }

    /**
     * Carrega filmes e atualiza a interface
     */
    carregarFilmes() {
        const self = this;
        window.FilmesService.listarFilmes(
            function(filmes) {
                self.renderFilmes(filmes);
                self.popularSelectFilmes(filmes);
            }
        );
    }

    /**
     * Cadastra um filme e atualiza a interface
     */
    cadastrarFilme() {
        const self = this;
        const dadosFilme = this.coletarDadosFormulario();
        
        window.FilmesService.cadastrarFilme(
            dadosFilme,
            function() {
                self.limparFormulario();
                self.carregarFilmes();
            }
        );
    }

    /**
     * Busca e exibe detalhes de um filme
     * @param {number} filmeId - ID do filme
     */
    buscarDetalhesFilme(filmeId) {
        const self = this;
        window.FilmesService.detalharFilme(
            filmeId,
            function(filme) {
                self.exibirDetalhesFilme(filme);
            }
        );
    }

    /**
     * Inicializa a página de filmes
     */
    inicializar() {
        // Previne múltiplas inicializações
        if (this.inicializado) {
            return;
        }
        
        // Verifica se os elementos existem antes de inicializar
        if ($('#filmes-tbody').length === 0) {
            return;
        }
        
        this.inicializado = true;
        const self = this;
        
        // Carrega filmes ao iniciar a página
        this.carregarFilmes();

        // Remove event listeners antigos para evitar duplicação
        $('#filme-form').off('submit');
        $(document).off('click', '.btn-visualizar');
        $(document).off('click', '#btn-cancelar');

        // Submit do formulário de cadastro
        $('#filme-form').on('submit', function(e) {
            e.preventDefault();
            self.cadastrarFilme();
        });

        // Botão visualizar detalhes (delegação de evento)
        $(document).on('click', '.btn-visualizar', function() {
            const filmeId = $(this).data('id');
            self.buscarDetalhesFilme(filmeId);
        });

        // Botão cancelar
        $(document).on('click', '#btn-cancelar', function() {
            self.limparFormulario();
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
window.filmesRenderer = new FilmesRenderer();

// ==================
// EVENT LISTENERS ||
// ==================

// Verifica periodicamente se a página de filmes foi carregada
setInterval(function() {
    // Se estiver na página de filmes e ainda não foi inicializada
    if (window.currentPage === 'filmes' && $('#filmes-tbody').length > 0) {
        window.filmesRenderer.inicializar();
    }
    // Se não estiver na página de filmes, reseta o estado
    else if (window.currentPage !== 'filmes' && window.filmesRenderer.inicializado) {
        window.filmesRenderer.resetar();
    }
}, 500);

// Inicialização quando o jQuery estiver pronto
$(document).ready(function() {
    // Tenta inicializar se já estiver na página de filmes
    if ($('#filmes-tbody').length > 0) {
        window.filmesRenderer.inicializar();
    }
});