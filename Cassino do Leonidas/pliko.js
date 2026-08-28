/* =========================================================
   PLINKO DA FORTUNA
   ========================================================= */


/* =========================================================
   ELEMENTOS
   ========================================================= */

const goldAmountElement =
    document.getElementById("gold-amount");

const betInput =
    document.getElementById("bet-input");

const maxBetButton =
    document.getElementById("max-bet-button");

const selectedBetElement =
    document.getElementById("selected-bet");

const resultMessage =
    document.getElementById("result-message");

const lastWinElement =
    document.getElementById("last-win");

const dropButton =
    document.getElementById("drop-button");

const plinkoBoard =
    document.getElementById("plinko-board");

const plinkoBall =
    document.getElementById("plinko-ball");

const multiplierElements =
    document.querySelectorAll(".multiplier");


/* =========================================================
   SISTEMA DE PEPITAS
   ========================================================= */

function obterSaldo() {

    const saldoSalvo =
        localStorage.getItem("goldAmount");


    if (saldoSalvo === null) {

        localStorage.setItem(
            "goldAmount",
            "1000"
        );

        return 1000;

    }


    const saldo =
        Number(saldoSalvo);


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
   SALVAR SALDO
   ========================================================= */

function salvarSaldo() {

    localStorage.setItem(
        "goldAmount",
        String(goldAmount)
    );

}


/* =========================================================
   ATUALIZAR SALDO
   ========================================================= */

function atualizarSaldo() {

    goldAmountElement.textContent =
        goldAmount.toLocaleString(
            "pt-BR"
        );

}


/* =========================================================
   APOSTA
   ========================================================= */

let aposta = 25;


function obterAposta() {

    const valor =
        Number(
            betInput.value
        );


    if (
        !Number.isFinite(valor) ||
        valor < 1
    ) {

        return 0;

    }


    return Math.floor(valor);

}


/* =========================================================
   ATUALIZAR APOSTA VISUAL
   ========================================================= */

function atualizarApostaVisual() {

    const valor =
        obterAposta();


    if (valor < 1) {

        selectedBetElement.textContent =
            "0 ◆";

        return;

    }


    selectedBetElement.textContent =
        `${valor.toLocaleString("pt-BR")} ◆`;

}


/* =========================================================
   APOSTAR TUDO
   ========================================================= */

maxBetButton.addEventListener(
    "click",
    function () {

        betInput.value =
            Math.floor(goldAmount);

        atualizarApostaVisual();

        betInput.focus();

    }
);


/* =========================================================
   MUDANÇA NO INPUT
   ========================================================= */

betInput.addEventListener(
    "input",
    function () {

        atualizarApostaVisual();

    }
);


/* =========================================================
   CONFIGURAÇÃO DO TABULEIRO
   ========================================================= */


/*
    Quantidade de linhas de pinos.
*/

const LINHAS =
    10;


/*
    Multiplicadores das casas finais.
*/

const multiplicadores = [

    0.3,
    0.6,
    1,
    1.5,
    5,
    1.5,
    1,
    0.6,
    0.3

];


/* =========================================================
   CRIAR PINOS
   ========================================================= */

function criarTabuleiro() {

    plinkoBoard.innerHTML = "";


    /*
        O board tem 10 linhas.

        Cada linha possui uma quantidade
        diferente de pinos.
    */

    for (
        let linha = 0;
        linha < LINHAS;
        linha++
    ) {

        const quantidade =
            linha + 2;


        const espacamentoX =
            100 / quantidade;


        for (
            let coluna = 0;
            coluna < quantidade;
            coluna++
        ) {

            const peg =
                document.createElement("div");

            peg.className =
                "peg";


            const x =
                (coluna + 0.5)
                * espacamentoX;


            const y =
                7 +
                linha * 8.9;


            peg.style.left =
                `${x}%`;

            peg.style.top =
                `${y}%`;


            plinkoBoard.appendChild(
                peg
            );

        }

    }

}


/* =========================================================
   POSIÇÃO DA BOLA
   ========================================================= */

function posicionarBola(
    x,
    y
) {

    plinkoBall.style.left =
        `${x}%`;

    plinkoBall.style.top =
        `${y}%`;

}


/* =========================================================
   ESPERAR
   ========================================================= */

function esperar(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );

}


/* =========================================================
   ANIMAÇÃO DE QUEDA
   ========================================================= */

async function animarBola(
    caminho,
    resultadoFinal
) {

    /*
        Torna a bola visível.
    */

    plinkoBall.style.opacity =
        "1";


    /*
        Começa no centro.
    */

    let x =
        50;


    posicionarBola(
        x,
        -3
    );


    await esperar(100);


    /*
        Cada escolha representa
        esquerda ou direita.
    */

    for (
        let i = 0;
        i < caminho.length;
        i++
    ) {

        const direcao =
            caminho[i];


        /*
            Quantidade de movimento.
        */

        const movimento =
            4.3;


        if (direcao === "esquerda") {

            x -= movimento;

        }

        else {

            x += movimento;

        }


        /*
            Mantém a bola dentro do board.
        */

        x =
            Math.max(
                4,
                Math.min(
                    96,
                    x
                )
            );


        const y =
            6 +
            (i + 1) *
            8.8;


        posicionarBola(
            x,
            y
        );


        await esperar(
            115
        );

    }


    /*
        Posição final.

        Converte o resultado
        para uma das 9 caixas.
    */

    const largura =
        100 /
        multiplicadores.length;


    const destinoX =
        resultadoFinal *
        largura +
        largura / 2;


    const destinoY =
        96;


    posicionarBola(
        destinoX,
        destinoY
    );


    await esperar(
        350
    );


    /*
        Esconde a bola.
    */

    plinkoBall.style.opacity =
        "0";

}


/* =========================================================
   GERAR CAMINHO
   ========================================================= */

function gerarCaminho() {

    /*
        Escolhe primeiro qual casa a bola vai atingir.

        Quanto maior o peso, maior a chance.
        O centro é propositalmente muito raro.

        Índices:

        0 = 0.2x
        1 = 0.5x
        2 = 0.7x
        3 = 1x
        4 = 5x
        5 = 1x
        6 = 0.7x
        7 = 0.5x
        8 = 0.2x
    */

    const pesos = [

        14, // 0.2x
        13, // 0.5x
        12, // 0.7x
        8,  // 1x
        4,  // 5x
        8,  // 1x
        12, // 0.7x
        13, // 0.5x
        14  // 0.2x

    ];


    const total =
        pesos.reduce(
            (soma, peso) =>
                soma + peso,
            0
        );


    let sorteio =
        Math.random() * total;


    let resultado =
        0;


    for (
        let i = 0;
        i < pesos.length;
        i++
    ) {

        sorteio -=
            pesos[i];


        if (
            sorteio <= 0
        ) {

            resultado = i;

            break;

        }

    }


    /*
        A quantidade de movimentos para a direita
        determina a posição final.

        Como existem 10 linhas, usamos:

        casa 0 → 1 movimento direita
        casa 1 → 2
        ...
        casa 8 → 9
    */

    const quantidadeDireita =
        resultado + 1;


    const caminho = [];


    /*
        Adiciona exatamente a quantidade
        necessária de movimentos para a direita.
    */

    for (
        let i = 0;
        i < quantidadeDireita;
        i++
    ) {

        caminho.push(
            "direita"
        );

    }


    /*
        Completa o restante com movimentos
        para a esquerda.
    */

    while (
        caminho.length < LINHAS
    ) {

        caminho.push(
            "esquerda"
        );

    }


    /*
        Embaralha o caminho para a trajetória
        continuar parecendo aleatória.
    */

    for (
        let i = caminho.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            caminho[i],
            caminho[j]
        ] = [
            caminho[j],
            caminho[i]
        ];

    }


    return caminho;

}


/* =========================================================
   GERAR RESULTADO
   ========================================================= */

function obterResultado(caminho) {

    let direita = 0;


    caminho.forEach(
        direcao => {

            if (
                direcao === "direita"
            ) {

                direita++;

            }

        }
    );


    /*
        Converte a quantidade de movimentos
        para a casa de destino.

        1 direita  = casa 0
        2 direitas = casa 1
        ...
        9 direitas = casa 8
    */

    let resultado =
        direita - 1;


    resultado =
        Math.max(
            0,
            Math.min(
                8,
                resultado
            )
        );


    return resultado;

}


/* =========================================================
   REMOVER DESTAQUE
   ========================================================= */

function limparMultiplicadores() {

    multiplierElements.forEach(
        element => {

            element.classList.remove(
                "active"
            );

        }
    );

}


/* =========================================================
   DESTACAR PRÊMIO
   ========================================================= */

function destacarMultiplicador(
    indice
) {

    limparMultiplicadores();


    if (
        multiplierElements[indice]
    ) {

        multiplierElements[indice]
            .classList.add(
                "active"
            );

    }

}


/* =========================================================
   MENSAGEM
   ========================================================= */

function mostrarMensagem(
    texto,
    tipo = ""
) {

    resultMessage.textContent =
        texto;


    resultMessage.className =
        "result-message";


    if (tipo !== "") {

        resultMessage.classList.add(
            tipo
        );

    }

}


/* =========================================================
   SOLTAR BOLA
   ========================================================= */

async function soltarBola() {

    /*
        Impede múltiplas jogadas.
    */

    if (
        dropButton.disabled
    ) {

        return;

    }


    /* =====================================================
       OBTER APOSTA
       ===================================================== */

    aposta =
        obterAposta();


    if (aposta < 1) {

        mostrarMensagem(
            "DIGITE UMA APOSTA VÁLIDA!"
        );

        betInput.focus();

        return;

    }


    /* =====================================================
       VERIFICAR SALDO
       ===================================================== */

    if (
        aposta > goldAmount
    ) {

        mostrarMensagem(
            "VOCÊ NÃO POSSUI PEPITAS SUFICIENTES!"
        );

        betInput.focus();

        return;

    }


    /* =====================================================
       DESCONTAR APOSTA
       ===================================================== */

    goldAmount -=
        aposta;


    salvarSaldo();

    atualizarSaldo();


    /* =====================================================
       BLOQUEAR CONTROLES
       ===================================================== */

    dropButton.disabled =
        true;

    maxBetButton.disabled =
        true;

    betInput.disabled =
        true;


    limparMultiplicadores();


    mostrarMensagem(
        "A BOLA ESTÁ DESCENDO..."
    );


    /* =====================================================
       GERAR CAMINHO
       ===================================================== */

    const caminho =
        gerarCaminho();


    const resultado =
        obterResultado(
            caminho
        );


    /* =====================================================
       ANIMAR
       ===================================================== */

    await animarBola(
        caminho,
        resultado
    );


    /* =====================================================
       MULTIPLICADOR
       ===================================================== */

    const multiplicador =
        multiplicadores[
            resultado
        ];


    const premio =
        Math.floor(
            aposta *
            multiplicador
        );


    /* =====================================================
       DESTACAR CASA
       ===================================================== */

    destacarMultiplicador(
        resultado
    );


    /* =====================================================
       ÚLTIMO PRÊMIO
       ===================================================== */

    lastWinElement.textContent =
        `Último prêmio: ${premio.toLocaleString("pt-BR")} ◆`;


    /* =====================================================
       PAGAMENTO
       ===================================================== */

    if (
        premio > 0
    ) {

        goldAmount +=
            premio;


        salvarSaldo();

        atualizarSaldo();


        /*
            JACKPOT
        */

        if (
            multiplicador === 10
        ) {

            mostrarMensagem(
                `JACKPOT! +${premio.toLocaleString("pt-BR")} ◆`,
                "jackpot"
            );

        }


        /*
            PRÊMIO NORMAL
        */

        else {

            mostrarMensagem(
                `A BOLA PAROU EM ${multiplicador}x! +${premio.toLocaleString("pt-BR")} ◆`,
                "win"
            );

        }

    }


    /* =====================================================
       VERIFICAR FALÊNCIA
       ===================================================== */

    if (
        goldAmount <= 0
    ) {

        goldAmount =
            0;


        salvarSaldo();

        atualizarSaldo();


        /*
            Pequeno atraso para mostrar
            o resultado antes de sair.
        */

        setTimeout(
            function () {

                window.location.href =
                    "index.html?falido=1";

            },
            900
        );


        return;

    }


    /* =====================================================
       LIBERAR CONTROLES
       ===================================================== */

    dropButton.disabled =
        false;

    maxBetButton.disabled =
        false;

    betInput.disabled =
        false;

}


/* =========================================================
   BOTÃO
   ========================================================= */

dropButton.addEventListener(
    "click",
    soltarBola
);


/* =========================================================
   ENTER
   ========================================================= */

betInput.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter"
        ) {

            soltarBola();

        }

    }
);


/* =========================================================
   SINCRONIZAÇÃO ENTRE ABAS
   ========================================================= */

window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key !== "goldAmount"
        ) {

            return;

        }


        goldAmount =
            obterSaldo();


        atualizarSaldo();


        if (
            Number(
                betInput.value
            ) >
            goldAmount
        ) {

            betInput.value =
                Math.floor(
                    goldAmount
                );

        }


        atualizarApostaVisual();

    }
);


/* =========================================================
   FALÊNCIA AO ABRIR
   ========================================================= */

function verificarFalencia() {

    if (
        goldAmount <= 0
    ) {

        goldAmount =
            0;

        salvarSaldo();

        atualizarSaldo();

        window.location.href =
            "index.html?falido=1";

        return true;

    }


    return false;

}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

criarTabuleiro();

atualizarSaldo();

betInput.value =
    aposta;

atualizarApostaVisual();

verificarFalencia();