// ============================
// CONFIGURAÇÃO E CONSTANTES ||
// ============================

const API_BASE_URL = 'http://localhost:8080';

const API_ENDPOINTS = {
    listarFilmes: `${API_BASE_URL}/filmes/listar`,
    cadastrarFilme: `${API_BASE_URL}/filmes/cadastrar`,
    detalharFilme: (id) => `${API_BASE_URL}/filmes/detalhar/${id}`
};

// Controle de inicialização para evitar múltiplas chamadas
let paginaFilmesInicializada = false;

// ==========================
// FUNÇÕES DE RENDERIZAÇÃO ||
// ==========================

/**
 * Renderiza a lista de filmes na tabela
 * @param {Array} filmes - Lista de filmes a serem renderizados
 */
function renderFilmes(filmes) {
    const tbody = $('#filmes-tbody');
    const vazioDiv = $('#filmes-vazio');
    const table = $('#filmes-table');

    tbody.empty();

    // Fail Fast: Verifica se há filmes antes de processar
    if (!filmes || filmes.length === 0) {
        exibirEstadoVazio(vazioDiv, table);
        return;
    }

    exibirTabela(vazioDiv, table);
    filmes.forEach(filme => tbody.append(criarLinhaFilme(filme)));
}

/**
 * Abrevia um texto longo
 * @param {string} texto - Texto a ser abreviado
 * @param {number} maxCaracteres - Número máximo de caracteres (padrão: 100)
 * @returns {string} Texto abreviado com reticências
 */
function abreviarTexto(texto, maxCaracteres = 100) {
    if (!texto || texto.length <= maxCaracteres) {
        return texto;
    }
    return texto.substring(0, maxCaracteres).trim() + '...';
}

/**
 * Cria uma linha da tabela para um filme
 * @param {Object} filme - Objeto contendo dados do filme
 * @returns {string} HTML da linha da tabela
 */
function criarLinhaFilme(filme) {
    return `
        <tr>
            <td>${filme.id}</td>
            <td>${filme.titulo}</td>
            <td>${abreviarTexto(filme.sinopse, 50)}</td>
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
function exibirEstadoVazio(vazioDiv, table) {
    vazioDiv.removeClass('d-none');
    table.addClass('d-none');
}

/**
 * Exibe a tabela de filmes
 */
function exibirTabela(vazioDiv, table) {
    vazioDiv.addClass('d-none');
    table.removeClass('d-none');
}

/**
 * Renderiza estrelas de avaliação
 * @param {number} nota - Nota de 1 a 5
 * @returns {string} HTML das estrelas
 */
function renderEstrelas(nota) {
    let estrelas = '';
    for (let i = 1; i <= 5; i++) {
        const icone = i <= nota ? 'bi-star-fill' : 'bi-star';
        estrelas += `<i class="bi ${icone}"></i> `;
    }
    return estrelas;
}

/**
 * Renderiza a lista de análises
 * @param {Array} analises - Lista de análises
 */
function renderAnalises(analises) {
    const container = $('#analises-container');
    container.empty();

    // Fail Fast: Verifica se há análises
    if (!analises || analises.length === 0) {
        container.html(criarMensagemVazia('Ainda não há análises cadastradas.'));
        return;
    }

    analises.forEach(analise => container.append(criarCardAnalise(analise)));
}

/**
 * Cria um card de análise
 * @param {Object} analise - Objeto contendo dados da análise
 * @returns {string} HTML do card
 */
function criarCardAnalise(analise) {
    const tituloFilme = analise?.filme?.titulo || 'Filme não encontrado';
    return `
        <div class="card mb-3">
            <div class="card-header d-flex justify-content-between">
                <strong>${tituloFilme}</strong>
                <span class="text-warning">
                    ${renderEstrelas(analise.nota)}
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
 * Cria mensagem de estado vazio
 * @param {string} mensagem - Mensagem a ser exibida
 * @returns {string} HTML da mensagem
 */
function criarMensagemVazia(mensagem) {
    return `
        <p class="d-flex justify-content-center text-muted fst-italic">
            ${mensagem}
        </p>
    `;
}

/**
 * Popula o select de filmes
 * @param {Array} filmes - Lista de filmes
 */
function popularSelectFilmes(filmes) {
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

// =======================================
// FUNÇÕES DE MANIPULAÇÃO DE FORMULÁRIO ||
// =======================================

/**
 * Limpa o formulário de filme
 */
function limparFormularioFilme() {
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
function coletarDadosFormulario() {
    return {
        titulo: $('#titulo').val().trim(),
        sinopse: $('#sinopse').val().trim(),
        genero: $('#genero').val().trim(),
        anoLancamento: $('#anoLancamento').val().trim()
    };
}

/**
 * Valida os dados do formulário
 * @param {Object} dados - Dados a serem validados
 * @returns {boolean} True se válido, false caso contrário
 */
function validarDadosFormulario(dados) {
    // Fail Fast: Validação de campos obrigatórios
    if (!dados.titulo || !dados.sinopse || !dados.genero || !dados.anoLancamento) {
        exibirMensagem('Todos os campos são obrigatórios!', 'warning');
        return false;
    }

    // Validação do ano
    const ano = parseInt(dados.anoLancamento);
    if (isNaN(ano) || ano < 1800 || ano > new Date().getFullYear() + 5) {
        exibirMensagem('Ano de lançamento inválido!', 'warning');
        return false;
    }

    return true;
}

// =================================
// FUNÇÕES DE COMUNICAÇÃO COM API ||
// =================================

/**
 * Carrega a lista de filmes da API
 */
function carregarFilmes() {
    $.ajax({
        url: API_ENDPOINTS.listarFilmes,
        method: 'GET',
        success: function (filmes) {
            renderFilmes(filmes);
            popularSelectFilmes(filmes);
        },
        error: function (xhr) {
            tratarErroRequisicao(xhr, 'Erro ao carregar filmes');
        }
    });
}

/**
 * Cadastra um novo filme na API
 * @param {Object} dadosFilme - Dados do filme a ser cadastrado
 */
function cadastrarFilme(dadosFilme) {
    // Fail Fast: Valida antes de enviar
    if (!validarDadosFormulario(dadosFilme)) {
        return;
    }

    $.ajax({
        url: API_ENDPOINTS.cadastrarFilme,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(dadosFilme),
        success: function (filmeCreated) {
            exibirMensagem(`Filme "${filmeCreated.titulo}" cadastrado com sucesso!`, 'success');
            limparFormularioFilme();
            carregarFilmes();
        },
        error: function (xhr) {
            tratarErroRequisicao(xhr, 'Erro ao cadastrar filme');
        }
    });
}

/**
 * Busca detalhes de um filme específico
 * @param {number} filmeId - ID do filme
 */
function buscarDetalhesFilme(filmeId) {
    $.ajax({
        url: API_ENDPOINTS.detalharFilme(filmeId),
        method: 'GET',
        success: function (filme) {
            exibirDetalhesFilme(filme);
        },
        error: function (xhr) {
            tratarErroRequisicao(xhr, 'Erro ao buscar detalhes do filme');
        }
    });
}

// =================================
// FUNÇÕES DE FEEDBACK AO USUÁRIO ||
// =================================

/**
 * Exibe mensagem de feedback ao usuário
 * @param {string} mensagem - Mensagem a ser exibida
 * @param {string} tipo - Tipo da mensagem (success, danger, warning, info)
 */
function exibirMensagem(mensagem, tipo = 'info') {
    // Remove alertas anteriores
    $('.alert-custom').remove();

    const alerta = `
        <div class="alert alert-${tipo} alert-dismissible fade show alert-custom" role="alert">
            <i class="bi bi-${obterIconeAlerta(tipo)} me-2"></i>
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
function obterIconeAlerta(tipo) {
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
function tratarErroRequisicao(xhr, mensagemPadrao) {
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

    exibirMensagem(mensagemErro, 'danger');
    console.error('Erro na requisição:', xhr);
}

/**
 * Exibe detalhes do filme em um modal
 * @param {Object} filme - Objeto contendo dados do filme
 */
function exibirDetalhesFilme(filme) {
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

// ==========================================
// INICIALIZAÇÃO DA PÁGINA DE FILMES ||
// ==========================================

/**
 * Inicializa a página de filmes
 * Deve ser chamada quando a página filmes.html for carregada
 */
function inicializarPaginaFilmes() {
    // Previne múltiplas inicializações
    if (paginaFilmesInicializada) {
        return;
    }
    
    // Verifica se os elementos existem antes de inicializar
    if ($('#filmes-tbody').length === 0) {
        return;
    }
    
    paginaFilmesInicializada = true;
    
    // Carrega filmes ao iniciar a página
    carregarFilmes();

    // Remove event listeners antigos para evitar duplicação
    $('#filme-form').off('submit');
    $(document).off('click', '.btn-visualizar');
    $(document).off('click', '#btn-cancelar');

    // Submit do formulário de cadastro
    $('#filme-form').on('submit', function (e) {
        e.preventDefault();
        const dadosFilme = coletarDadosFormulario();
        cadastrarFilme(dadosFilme);
    });

    // Botão visualizar detalhes (delegação de evento)
    $(document).on('click', '.btn-visualizar', function () {
        const filmeId = $(this).data('id');
        buscarDetalhesFilme(filmeId);
    });

    // Botão cancelar
    $(document).on('click', '#btn-cancelar', function () {
        limparFormularioFilme();
    });
}

/**
 * Reseta o estado de inicialização quando sair da página de filmes
 */
function resetarInicializacaoFilmes() {
    paginaFilmesInicializada = false;
}

// ==================
// EVENT LISTENERS ||
// ==================

// Verifica periodicamente se a página de filmes foi carregada
setInterval(function() {
    // Se estiver na página de filmes e ainda não foi inicializada
    if (window.currentPage === 'filmes' && $('#filmes-tbody').length > 0) {
        inicializarPaginaFilmes();
    }
    // Se não estiver na página de filmes, reseta o estado
    else if (window.currentPage !== 'filmes' && paginaFilmesInicializada) {
        resetarInicializacaoFilmes();
    }
}, 500);

// Inicialização quando o jQuery estiver pronto
$(document).ready(function() {
    // Tenta inicializar se já estiver na página de filmes
    if ($('#filmes-tbody').length > 0) {
        inicializarPaginaFilmes();
    }
});