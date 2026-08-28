/* =========================================================
   HIGHER OR LOWER
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

const currentBetElement =
    document.getElementById("current-bet");

const currentPrizeElement =
    document.getElementById("current-prize");

const currentMultiplierElement =
    document.getElementById("current-multiplier");

const currentCardElement =
    document.getElementById("current-card");

const currentCardCenter =
    document.getElementById("current-card-center");

const nextCardElement =
    document.getElementById("next-card");

const resultMessage =
    document.getElementById("result-message");

const higherButton =
    document.getElementById("higher-button");

const lowerButton =
    document.getElementById("lower-button");

const cashoutButton =
    document.getElementById("cashout-button");

const betArea =
    document.getElementById("bet-area");

const streakInfo =
    document.getElementById("streak-info");


/* =========================================================
   SISTEMA DE PEPITAS
   ========================================================= */

function obterSaldo() {

    const saldoSalvo =
        localStorage.getItem("goldAmount");


    if (
        saldoSalvo === null
    ) {

        localStorage.setItem(
            "goldAmount",
            "1000"
        );

        return 1000;

    }


    const saldo =
        Number(
            saldoSalvo
        );


    if (
        !Number.isFinite(saldo)
    ) {

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
   BARALHO
   ========================================================= */

const naipes = [

    {
        simbolo: "♥",
        vermelho: true
    },

    {
        simbolo: "♦",
        vermelho: true
    },

    {
        simbolo: "♣",
        vermelho: false
    },

    {
        simbolo: "♠",
        vermelho: false
    }

];


const nomesNumeros = {

    1: "A",

    2: "2",

    3: "3",

    4: "4",

    5: "5",

    6: "6",

    7: "7",

    8: "8",

    9: "9",

    10: "10",

    11: "J",

    12: "Q",

    13: "K"

};


/* =========================================================
   MULTIPLICADORES
   ========================================================= */

const multiplicadores = [

    1,
    1.5,
    2,
    3,
    5,
    8

];


/* =========================================================
   ESTADO
   ========================================================= */

let baralho = [];

let cartaAtual = null;

let apostaAtual = 0;

let premioAtual = 0;

let sequencia = 0;

let emRodada = false;


/* =========================================================
   APOSTA
   ========================================================= */

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


    return Math.floor(
        valor
    );

}


/* =========================================================
   FORMATAR MULTIPLICADOR
   ========================================================= */

function formatarMultiplicador(
    valor
) {

    return `x${valor.toFixed(2)}`;

}


/* =========================================================
   CRIAR BARALHO
   ========================================================= */

function criarBaralho() {

    const novoBaralho = [];


    for (
        let valor = 1;
        valor <= 13;
        valor++
    ) {

        naipes.forEach(
            naipe => {

                novoBaralho.push({

                    valor:
                        valor,

                    nome:
                        nomesNumeros[
                            valor
                        ],

                    naipe:
                        naipe.simbolo,

                    vermelho:
                        naipe.vermelho

                });

            }
        );

    }


    /*
        Embaralha o baralho.
    */

    for (
        let i = novoBaralho.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            novoBaralho[i],
            novoBaralho[j]
        ] =
        [
            novoBaralho[j],
            novoBaralho[i]
        ];

    }


    baralho =
        novoBaralho;

}


/* =========================================================
   PEGAR CARTA
   ========================================================= */

function pegarCarta() {

    /*
        Se o baralho acabar,
        cria outro.
    */

    if (
        baralho.length === 0
    ) {

        criarBaralho();

    }


    return baralho.pop();

}


/* =========================================================
   MOSTRAR CARTA
   ========================================================= */

function mostrarCarta(
    elemento,
    carta
) {

    elemento.classList.remove(
        "hidden-card"
    );

    elemento.classList.remove(
        "revealed"
    );

    elemento.classList.remove(
        "red"
    );


    if (
        carta.vermelho
    ) {

        elemento.classList.add(
            "red"
        );

    }


    /*
        Remove conteúdo anterior.
    */

    elemento.innerHTML = "";


    /*
        Canto superior.
    */

    const top =
        document.createElement(
            "div"
        );

    top.className =
        "card-corner top";


    const topRank =
        document.createElement(
            "span"
        );

    topRank.className =
        "card-rank";

    topRank.textContent =
        carta.nome;


    const topSuit =
        document.createElement(
            "span"
        );

    topSuit.className =
        "card-suit";

    topSuit.textContent =
        carta.naipe;


    top.appendChild(
        topRank
    );

    top.appendChild(
        topSuit
    );


    /*
        Centro.
    */

    const center =
        document.createElement(
            "div"
        );

    center.className =
        "card-center";

    center.textContent =
        carta.naipe;


    /*
        Canto inferior.
    */

    const bottom =
        document.createElement(
            "div"
        );

    bottom.className =
        "card-corner bottom";


    const bottomRank =
        document.createElement(
            "span"
        );

    bottomRank.className =
        "card-rank";

    bottomRank.textContent =
        carta.nome;


    const bottomSuit =
        document.createElement(
            "span"
        );

    bottomSuit.className =
        "card-suit";

    bottomSuit.textContent =
        carta.naipe;


    bottom.appendChild(
        bottomRank
    );

    bottom.appendChild(
        bottomSuit
    );


    elemento.appendChild(
        top
    );

    elemento.appendChild(
        center
    );

    elemento.appendChild(
        bottom
    );


    /*
        Animação.
    */

    elemento.classList.add(
        "card-reveal"
    );


    setTimeout(
        function () {

            elemento.classList.remove(
                "card-reveal"
            );

        },
        500
    );

}


/* =========================================================
   ATUALIZAR INTERFACE
   ========================================================= */

function atualizarInterface() {

    currentBetElement.textContent =
        `${apostaAtual.toLocaleString("pt-BR")} ◆`;


    currentPrizeElement.textContent =
        `${premioAtual.toLocaleString("pt-BR")} ◆`;


    const multiplicadorAtual =
        sequencia === 0
            ? 1
            : multiplicadores[
                Math.min(
                    sequencia - 1,
                    multiplicadores.length - 1
                )
            ];


    currentMultiplierElement.textContent =
        formatarMultiplicador(
            multiplicadorAtual
        );


    streakInfo.textContent =
        `Sequência: ${sequencia}`;

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


    if (
        tipo !== ""
    ) {

        resultMessage.classList.add(
            tipo
        );

    }

}

/* =========================================================
   ATUALIZAR CARTA INICIAL
   ========================================================= */

function prepararJogo() {

    criarBaralho();


    /*
        Verifica se já existe uma carta inicial
        salva nesta sessão.
    */

    const cartaSalva =
        sessionStorage.getItem(
            "higherLowerCartaInicial"
        );


    if (
        cartaSalva !== null
    ) {

        /*
            Recupera a carta que já estava
            sendo mostrada.
        */

        cartaAtual =
            JSON.parse(
                cartaSalva
            );

    }

    else {

        /*
            Primeira entrada no jogo.
            Sorteia uma carta nova.
        */

        cartaAtual =
            pegarCarta();


        /*
            Salva a carta para que um
            recarregamento não a altere.
        */

        sessionStorage.setItem(
            "higherLowerCartaInicial",
            JSON.stringify(
                cartaAtual
            )
        );

    }


    mostrarCarta(
        currentCardElement,
        cartaAtual
    );


    nextCardElement.innerHTML =
        "<span>?</span>";


    nextCardElement.className =
        "playing-card hidden-card";


    apostaAtual = 0;

    premioAtual = 0;

    sequencia = 0;

    emRodada = false;


    betArea.style.display =
        "block";


    higherButton.disabled =
        false;

    lowerButton.disabled =
        false;


    higherButton.style.display =
        "flex";

    lowerButton.style.display =
        "flex";


    cashoutButton.disabled =
        true;


    atualizarInterface();


    mostrarMensagem(
        "FAÇA SUA APOSTA E ESCOLHA!"
    );

}



/* =========================================================
   APOSTAR
   ========================================================= */

function iniciarRodada() {

    /*
        Se já existe uma rodada,
        não cria outra.
    */

    if (
        emRodada
    ) {

        return true;

    }


    const aposta =
        obterAposta();


    if (
        aposta < 1
    ) {

        mostrarMensagem(
            "DIGITE UMA APOSTA VÁLIDA!"
        );

        betInput.focus();

        return false;

    }


    if (
        aposta > goldAmount
    ) {

        mostrarMensagem(
            "VOCÊ NÃO POSSUI PEPITAS SUFICIENTES!"
        );

        betInput.focus();

        return false;

    }


    /*
        Desconta a aposta.
    */

    goldAmount -=
        aposta;


    salvarSaldo();

    atualizarSaldo();


    apostaAtual =
        aposta;

    premioAtual =
        aposta;

    sequencia =
        0;


    emRodada =
        true;


    betArea.style.display =
        "none";


    cashoutButton.disabled =
        true;


    atualizarInterface();


    return true;

}


/* =========================================================
   ESCOLHER MAIOR / MENOR
   ========================================================= */

async function escolher(
    escolha
) {

    /*
        Começa a rodada se ainda não começou.
    */

    if (
        !iniciarRodada()
    ) {

        return;

    }


    /*
        Bloqueia os botões
        durante a animação.
    */

    higherButton.disabled =
        true;

    lowerButton.disabled =
        true;

    cashoutButton.disabled =
        true;


    mostrarMensagem(
        "REVELANDO A PRÓXIMA CARTA..."
    );


    await esperar(
        350
    );


    const novaCarta =
        pegarCarta();


    mostrarCarta(
        nextCardElement,
        novaCarta
    );


    await esperar(
        500
    );


    /*
        Empate.
    */

    if (
        novaCarta.valor ===
        cartaAtual.valor
    ) {

        mostrarMensagem(
            "EMPATE! A CARTA ATUAL FOI MANTIDA."
        );


        /*
            A carta nova passa a ser
            a carta atual?
            
            Não. Descartamos a nova
            e mantemos a anterior.
        */

        nextCardElement.innerHTML =
            "<span>?</span>";

        nextCardElement.className =
            "playing-card hidden-card";


        higherButton.disabled =
            false;

        lowerButton.disabled =
            false;


        cashoutButton.disabled =
            sequencia === 0;


        return;

    }


    let acertou;


    if (
        escolha === "higher"
    ) {

        acertou =
            novaCarta.valor >
            cartaAtual.valor;

    }

    else {

        acertou =
            novaCarta.valor <
            cartaAtual.valor;

    }


    /* =====================================================
       ERRO
       ===================================================== */

    if (
        !acertou
    ) {

        mostrarMensagem(
            `VOCÊ PERDEU! A CARTA ERA ${novaCarta.nome}${novaCarta.naipe}`,
            "loss"
        );


        /*
            Aposta já foi descontada.
        */

        premioAtual =
            0;


        atualizarInterface();


        /*
            Espera um pouco antes de
            preparar a próxima rodada.
        */

        await esperar(
            1100
        );


        finalizarRodada();

        return;

    }


    /* =====================================================
       ACERTO
       ===================================================== */

    sequencia++;


    const indice =
        Math.min(
            sequencia - 1,
            multiplicadores.length - 1
        );


    const multiplicador =
        multiplicadores[
            indice
        ];


    premioAtual =
        Math.floor(
            apostaAtual *
            multiplicador
        );


    cartaAtual =
        novaCarta;


    /*
        A nova carta vira a carta atual.
    */

    mostrarCarta(
        currentCardElement,
        cartaAtual
    );


    nextCardElement.innerHTML =
        "<span>?</span>";

    nextCardElement.className =
        "playing-card hidden-card";


    atualizarInterface();


    /*
        Último nível.
    */

    if (
        sequencia >=
        multiplicadores.length
    ) {

        cashoutButton.disabled =
            true;

        higherButton.disabled =
            true;

        lowerButton.disabled =
            true;


        mostrarMensagem(
            `JACKPOT! VOCÊ CHEGOU A ${multiplicador}x! +${premioAtual.toLocaleString("pt-BR")} ◆`,
            "jackpot"
        );


        await esperar(
            1000
        );


        receberPremio();

        return;

    }


    mostrarMensagem(
        `ACERTOU! PRÊMIO ATUAL: ${premioAtual.toLocaleString("pt-BR")} ◆`,
        "win"
    );


    /*
        Agora o jogador pode sacar
        ou continuar.
    */

    cashoutButton.disabled =
        false;

    higherButton.disabled =
        false;

    lowerButton.disabled =
        false;

}


/* =========================================================
   PEGAR PRÊMIO
   ========================================================= */

function receberPremio() {

    if (
        !emRodada ||
        premioAtual <= 0
    ) {

        return;

    }


    goldAmount +=
        premioAtual;


    salvarSaldo();

    atualizarSaldo();


    mostrarMensagem(
        `PRÊMIO RESGATADO! +${premioAtual.toLocaleString("pt-BR")} ◆`,
        "win"
    );


    finalizarRodada();

}


/* =========================================================
   FINALIZAR RODADA
   ========================================================= */

function finalizarRodada() {

    /*
        Remove a carta inicial salva.

        A próxima rodada deverá começar
        com uma carta nova.
    */

    sessionStorage.removeItem(
        "higherLowerCartaInicial"
    );


    emRodada =
        false;


    apostaAtual =
        0;

    premioAtual =
        0;

    sequencia =
        0;


    betArea.style.display =
        "block";


    higherButton.disabled =
        false;

    lowerButton.disabled =
        false;


    cashoutButton.disabled =
        true;


    nextCardElement.innerHTML =
        "<span>?</span>";

    nextCardElement.className =
        "playing-card hidden-card";


    atualizarInterface();


    if (
        goldAmount <= 0
    ) {

        goldAmount =
            0;

        salvarSaldo();

        atualizarSaldo();


        setTimeout(
            function () {

                window.location.href =
                    "index.html?falido=1";

            },
            700
        );


        return;

    }


    setTimeout(
        function () {

            mostrarMensagem(
                "FAÇA SUA APOSTA E ESCOLHA!"
            );

        },
        300
    );

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
   BOTÃO APOSTAR TUDO
   ========================================================= */

maxBetButton.addEventListener(
    "click",
    function () {

        betInput.value =
            Math.floor(
                goldAmount
            );

        betInput.focus();

    }
);


/* =========================================================
   BOTÕES
   ========================================================= */

higherButton.addEventListener(
    "click",
    function () {

        escolher(
            "higher"
        );

    }
);


lowerButton.addEventListener(
    "click",
    function () {

        escolher(
            "lower"
        );

    }
);


cashoutButton.addEventListener(
    "click",
    function () {

        receberPremio();

    }
);


/* =========================================================
   ENTER
   ========================================================= */

betInput.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter" &&
            !emRodada
        ) {

            iniciarRodada();

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
            !emRodada &&
            Number(
                betInput.value
            ) > goldAmount
        ) {

            betInput.value =
                Math.floor(
                    goldAmount
                );

        }

    }
);


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

atualizarSaldo();

prepararJogo();