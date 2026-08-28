/* =========================================================
   CONFIGURAÇÕES DOS JOGOS
   ========================================================= */

/*
    Para adicionar um novo jogo, basta copiar um bloco
    e alterar os valores.

    imagem:
        Caminho da imagem/ícone do jogo.

    pagina:
        Página HTML que será aberta quando clicar em JOGAR.
*/

const jogos = [

    {
        id: "jogo-1",

        nome: "Caça-níquel da Fortuna",

        descricao: "Gire os rolos e tente encontrar a combinação da fortuna.",

        imagem: "imagens/cacaniquel.png",

        pagina: "cacaniquel.html",

        multiplicador: "x20"
    },

    {
        id: "jogo-2",

        nome: "Plinko Dourado",

        descricao: "Solte a bola e tente acertar os maiores multiplicadores.",

        imagem: "imagens/plinko.png",

        pagina: "pliko.html",

        multiplicador: "x10"
    },

    {
        id: "jogo-3",

        nome: "Higher or Lower",

        descricao: "Adivinhe se a próxima carta será maior ou menor e aumente seu prêmio.",

        imagem: "imagens/higherlower.png",

        pagina: "higherlower.html",

        multiplicador: "x12"
    },

];


/* =========================================================
   ELEMENTOS DA PÁGINA
   ========================================================= */

const gamesContainer =
    document.querySelector(".games-container");

const goldAmountElement =
    document.getElementById("gold-amount");


/* =========================================================
   SISTEMA DE PEPITAS
   ========================================================= */

/*
    A loja e a tela inicial usam a mesma chave:

        goldAmount

    Portanto, o saldo é compartilhado entre as páginas.

    IMPORTANTE:

    Só cria as 1000 pepitas caso ainda não exista
    nenhum saldo salvo.

    Ao voltar para esta página, o saldo existente
    simplesmente será recuperado.
*/

function obterSaldo() {

    const saldoSalvo =
        localStorage.getItem("goldAmount");


    /*
        Primeiro acesso
    */

    if (saldoSalvo === null) {

        localStorage.setItem(
            "goldAmount",
            "1000"
        );

        return 1000;

    }


    /*
        Recupera o saldo existente
    */

    const saldo =
        Number(saldoSalvo);


    /*
        Caso o valor salvo esteja inválido,
        corrige para 1000.
    */

    if (!Number.isFinite(saldo)) {

        localStorage.setItem(
            "goldAmount",
            "1000"
        );

        return 1000;

    }


    return saldo;

}


let goldAmount =
    obterSaldo();


/* =========================================================
   ATUALIZAR SALDO NA TELA
   ========================================================= */

function atualizarSaldo() {

    goldAmountElement.textContent =
        goldAmount.toLocaleString("pt-BR");

}


/* =========================================================
   CRIAR CARD DE JOGO
   ========================================================= */

function criarJogo(jogo) {

    /*
        ARTICLE
    */

    const card =
        document.createElement("article");

    card.className =
        "game-card";


    /* =====================================================
       IMAGEM
       ===================================================== */

    const gameImage =
        document.createElement("div");

    gameImage.className =
        "game-image";


    /*
        Se houver imagem, mostra a imagem.
    */

    if (jogo.imagem) {

        const imagem =
            document.createElement("img");

        imagem.src =
            jogo.imagem;

        imagem.alt =
            jogo.nome;

        imagem.className =
            "game-icon";


        /*
            Caso a imagem não seja encontrada,
            mostra um texto no lugar.
        */

        imagem.onerror = function () {

            imagem.remove();

            const placeholder =
                document.createElement("div");

            placeholder.className =
                "game-placeholder";

            placeholder.textContent =
                "JOGO";

            gameImage.appendChild(
                placeholder
            );

        };


        gameImage.appendChild(
            imagem
        );

    } else {

        /*
            Caso não exista imagem cadastrada.
        */

        const placeholder =
            document.createElement("div");

        placeholder.className =
            "game-placeholder";

        placeholder.textContent =
            "JOGO";

        gameImage.appendChild(
            placeholder
        );

    }


    /* =====================================================
       INFORMAÇÕES
       ===================================================== */

    const gameInfo =
        document.createElement("div");

    gameInfo.className =
        "game-info";


    /*
        NOME
    */

    const nome =
        document.createElement("h2");

    nome.textContent =
        jogo.nome;


    /*
        DESCRIÇÃO
    */

    const descricao =
        document.createElement("p");

    descricao.className =
        "game-description";

    descricao.textContent =
        jogo.descricao;


    /* =====================================================
       PARTE INFERIOR
       ===================================================== */

    const gameBottom =
        document.createElement("div");

    gameBottom.className =
        "game-bottom";


    /*
        MULTIPLICADOR
    */

    const multiplier =
        document.createElement("span");

    multiplier.className =
        "multiplier";

    multiplier.innerHTML =
        `MULTIPLICADOR:
         <strong class="game-multiplier">
            ${jogo.multiplicador}
         </strong>`;


    /*
        BOTÃO JOGAR
    */

    const playButton =
        document.createElement("button");

    playButton.className =
        "play-button";

    playButton.textContent =
        "JOGAR";


    /*
        Abre a página do jogo.
    */

    playButton.addEventListener(
        "click",
        function () {

            window.location.href =
                jogo.pagina;

        }
    );


    /* =====================================================
       MONTAGEM
       ===================================================== */

    gameBottom.appendChild(
        playButton
    );


    gameInfo.appendChild(
        nome
    );

    gameInfo.appendChild(
        descricao
    );

    gameInfo.appendChild(
        gameBottom
    );


    card.appendChild(
        gameImage
    );

    card.appendChild(
        gameInfo
    );


    return card;

}


/* =========================================================
   RENDERIZAR JOGOS
   ========================================================= */

function renderizarJogos() {

    /*
        Limpa os cards existentes no HTML.
    */

    gamesContainer.innerHTML = "";


    /*
        Cria os jogos cadastrados.
    */

    jogos.forEach(
        jogo => {

            const elemento =
                criarJogo(jogo);

            gamesContainer.appendChild(
                elemento
            );

        }
    );

}


/* =========================================================
   SINCRONIZAÇÃO ENTRE ABAS
   ========================================================= */

/*
    Caso o jogador tenha a loja aberta em outra aba
    e altere o saldo, a tela inicial será atualizada.
*/

window.addEventListener(
    "storage",
    function (event) {

        if (event.key !== "goldAmount") {

            return;

        }


        goldAmount =
            obterSaldo();


        atualizarSaldo();

    }
);

/* =========================================================
   TELA DE FALÊNCIA
   ========================================================= */

const bankruptOverlay =
    document.getElementById("bankrupt-overlay");

const restartGameButton =
    document.getElementById("restart-game-button");


function verificarFalencia() {

    const parametros =
        new URLSearchParams(
            window.location.search
        );

    const falido =
        parametros.get("falido");


    /*
        Mostra a tela caso tenha vindo
        do caça-níquel após falir.
    */

    if (falido === "1") {

        bankruptOverlay.style.display = "flex";

        // Pequeno atraso para permitir
        // a animação de entrada
        requestAnimationFrame(function () {

            bankruptOverlay.classList.add("show");

        });

    }

}


function recomecarJogo() {

    // Restaura o saldo
    goldAmount = 1000;

    localStorage.setItem(
        "goldAmount",
        "1000"
    );

    // Atualiza o valor mostrado no cabeçalho
    atualizarSaldo();

    // Esconde a tela de falência
    bankruptOverlay.classList.remove("show");

    // Garante que o overlay fique realmente invisível
    bankruptOverlay.style.display = "none";

    // Remove o parâmetro ?falido=1 da URL
    window.history.replaceState(
        {},
        document.title,
        "index.html"
    );

}


restartGameButton.addEventListener(
    "click",
    recomecarJogo
);


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

atualizarSaldo();

renderizarJogos();

verificarFalencia();