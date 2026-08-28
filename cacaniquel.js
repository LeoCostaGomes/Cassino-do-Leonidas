/* =========================================================
   CAÇA-NÍQUEL DA FORTUNA
   ========================================================= */


/* =========================================================
   ELEMENTOS DA PÁGINA
   ========================================================= */

const goldAmountElement =
    document.getElementById("gold-amount");

const betInput =
    document.getElementById("bet-input");

const maxBetButton =
    document.getElementById("max-bet-button");

const resultMessage =
    document.getElementById("result-message");

const lastWinElement =
    document.getElementById("last-win");

const spinButton =
    document.getElementById("spin-button");

const reels = [
    document.getElementById("reel-1"),
    document.getElementById("reel-2"),
    document.getElementById("reel-3")
];


/* =========================================================
   SISTEMA DE PEPITAS
   ========================================================= */

/*
    A chave "goldAmount" é a mesma usada pela loja
    e pela tela inicial.

    Portanto:

    index.html
          ↕
    goldAmount
          ↕
    loja.html
          ↕
    cacaniquel.html
*/

function obterSaldo() {

    const saldoSalvo =
        localStorage.getItem("goldAmount");


    /*
        Primeiro acesso do jogador.
    */

    if (saldoSalvo === null) {

        localStorage.setItem(
            "goldAmount",
            "1000"
        );

        return 1000;

    }


    /*
        Converte o valor armazenado
        para número.
    */

    const saldo =
        Number(saldoSalvo);


    /*
        Corrige valores inválidos.
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


/*
    Saldo atual do jogador.
*/

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
   ATUALIZAR SALDO NA INTERFACE
   ========================================================= */

function atualizarSaldo() {

    goldAmountElement.textContent =
        goldAmount.toLocaleString("pt-BR");

}


/* =========================================================
   CONFIGURAÇÃO DOS SÍMBOLOS
   ========================================================= */

/*
    premio:

    Representa quantas vezes a aposta será multiplicada
    caso apareçam 3 símbolos iguais.

    Exemplo:

    aposta = 25

    7 7 7

    25 × 20 = 500
*/

const simbolos = [

    {
        id: "sete",
        visual: "7",
        premio: 20
    },

    {
        id: "diamante",
        visual: "◆",
        premio: 10
    },

    {
        id: "trevo",
        visual: "🍀",
        premio: 7
    },

    {
        id: "cereja",
        visual: "🍒",
        premio: 5
    },

    {
        id: "sino",
        visual: "🔔",
        premio: 4
    },

    {
        id: "moeda",
        visual: "●",
        premio: 3
    }

];


/*
    Quando aparecem apenas 2 símbolos iguais,
    o jogador recebe 1.5x a aposta.
*/

const DOIS_IGUAIS =
    1.5;


/* =========================================================
   APOSTA
   ========================================================= */

let aposta = 25;


/* =========================================================
   OBTER APOSTA DIGITADA
   ========================================================= */

function obterAposta() {

    const valor =
        Number(
            betInput.value
        );


    /*
        Impede valores inválidos.
    */

    if (
        !Number.isFinite(valor) ||
        valor < 1
    ) {

        return 0;

    }


    /*
        Apenas números inteiros são aceitos.
    */

    return Math.floor(valor);

}


/* =========================================================
   BOTÃO "APOSTAR TUDO"
   ========================================================= */

maxBetButton.addEventListener(
    "click",
    function () {

        /*
            Coloca todo o saldo atual
            no campo de aposta.
        */

        betInput.value =
            Math.floor(goldAmount);


        betInput.focus();

    }
);


/* =========================================================
   GERAR SÍMBOLO ALEATÓRIO
   ========================================================= */

function obterSimboloAleatorio() {

    const indice =
        Math.floor(
            Math.random() *
            simbolos.length
        );


    return simbolos[indice];

}


/* =========================================================
   ANIMAR ROLO
   ========================================================= */

function animarReel(
    reel,
    duracao
) {

    return new Promise(
        resolve => {

            /*
                Enquanto o rolo estiver girando,
                os símbolos são trocados rapidamente.
            */

            const intervalo =
                setInterval(
                    function () {

                        const simbolo =
                            obterSimboloAleatorio();


                        const symbolElement =
                            reel.querySelector(
                                ".symbol"
                            );


                        symbolElement.textContent =
                            simbolo.visual;

                    },
                    80
                );


            /*
                Para o rolo depois da duração.
            */

            setTimeout(
                function () {

                    clearInterval(
                        intervalo
                    );


                    /*
                        Define o resultado final.
                    */

                    const resultado =
                        obterSimboloAleatorio();


                    resolve(
                        resultado
                    );

                },
                duracao
            );

        }
    );

}


/* =========================================================
   MOSTRAR RESULTADO NOS ROLOS
   ========================================================= */

function mostrarSimbolos(
    resultado
) {

    resultado.forEach(
        function (simbolo, indice) {

            const symbolElement =
                reels[indice]
                    .querySelector(
                        ".symbol"
                    );


            symbolElement.textContent =
                simbolo.visual;

        }
    );

}


/* =========================================================
   CALCULAR PRÊMIO
   ========================================================= */

function calcularPremio(
    resultado
) {

    const primeiro =
        resultado[0];

    const segundo =
        resultado[1];

    const terceiro =
        resultado[2];


    /* =====================================================
       3 SÍMBOLOS IGUAIS
       ===================================================== */

    if (
        primeiro.id === segundo.id &&
        segundo.id === terceiro.id
    ) {

        return aposta * primeiro.premio;

    }


    /* =====================================================
       2 SÍMBOLOS IGUAIS
       ===================================================== */

    if (
        primeiro.id === segundo.id ||
        primeiro.id === terceiro.id ||
        segundo.id === terceiro.id
    ) {

        return Math.floor(
            aposta * DOIS_IGUAIS
        );

    }


    /* =====================================================
       NENHUM PRÊMIO
       ===================================================== */

    return 0;

}


/* =========================================================
   MOSTRAR MENSAGEM
   ========================================================= */

function mostrarMensagem(
    texto,
    tipo = ""
) {

    resultMessage.textContent =
        texto;


    /*
        Remove classes anteriores.
    */

    resultMessage.className =
        "result-message";


    /*
        Adiciona a classe atual.
    */

    if (tipo !== "") {

        resultMessage.classList.add(
            tipo
        );

    }

}


/* =========================================================
   GIRAR CAÇA-NÍQUEL
   ========================================================= */

async function girar() {

    /*
        Impede vários giros simultâneos.
    */

    if (spinButton.disabled) {

        return;

    }


    /* =====================================================
       VERIFICAR APOSTA
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

    if (aposta > goldAmount) {

        mostrarMensagem(
            "VOCÊ NÃO POSSUI PEPITAS SUFICIENTES!"
        );

        betInput.focus();

        return;

    }


    /* =====================================================
       DESCONTAR APOSTA
       ===================================================== */

    goldAmount -= aposta;


    salvarSaldo();

    atualizarSaldo();


    /* =====================================================
       BLOQUEAR CONTROLES
       ===================================================== */

    spinButton.disabled = true;

    maxBetButton.disabled = true;

    betInput.disabled = true;


    mostrarMensagem(
        "OS ROLOS ESTÃO GIRANDO..."
    );


    /* =====================================================
       GIRAR OS 3 ROLOS
       ===================================================== */

    const resultados =
        await Promise.all(
            [

                animarReel(
                    reels[0],
                    900
                ),

                animarReel(
                    reels[1],
                    1250
                ),

                animarReel(
                    reels[2],
                    1600
                )

            ]
        );


    /* =====================================================
       MOSTRAR RESULTADO
       ===================================================== */

    mostrarSimbolos(
        resultados
    );


    /* =====================================================
       CALCULAR PRÊMIO
       ===================================================== */

    const premio =
        calcularPremio(
            resultados
        );


    /* =====================================================
       ATUALIZAR ÚLTIMO PRÊMIO
       ===================================================== */

    lastWinElement.textContent =
        `Último prêmio: ${premio.toLocaleString("pt-BR")} ◆`;


    /* =====================================================
       JOGADOR GANHOU
       ===================================================== */

    if (premio > 0) {

        goldAmount += premio;


        salvarSaldo();

        atualizarSaldo();


        /* =================================================
           JACKPOT
           ================================================= */

        if (
            resultados[0].id === "sete" &&
            resultados[1].id === "sete" &&
            resultados[2].id === "sete"
        ) {

            mostrarMensagem(
                `JACKPOT! +${premio.toLocaleString("pt-BR")} ◆`,
                "jackpot"
            );

        }

        else {

            mostrarMensagem(
                `VOCÊ GANHOU ${premio.toLocaleString("pt-BR")} ◆`,
                "win"
            );

        }

    }

    else {

        /* =================================================
           SEM PRÊMIO
           ================================================= */

        mostrarMensagem(
            "NÃO FOI DESSA VEZ...",
            "loss"
        );

    }


    /* =====================================================
       VERIFICAR FALÊNCIA
       ===================================================== */

    /*
        Só considera falência depois de calcular
        qualquer prêmio do giro.

        Dessa maneira, se o jogador apostar seu
        último valor e ganhar, ele não será enviado
        para a tela de falência.
    */

    if (goldAmount <= 0) {

        goldAmount = 0;


        salvarSaldo();

        atualizarSaldo();


        /*
            Pequeno atraso para mostrar o resultado
            do último giro.
        */

        setTimeout(
            function () {

                window.location.href =
                    "index.html?falido=1";

            },
            700
        );


        return;

    }


    /* =====================================================
       LIBERAR CONTROLES
       ===================================================== */

    spinButton.disabled = false;

    maxBetButton.disabled = false;

    betInput.disabled = false;

}

/* =========================================================
   VERIFICAR FALÊNCIA
   ========================================================= */

function verificarFalencia() {

    if (goldAmount <= 0) {

        goldAmount = 0;

        salvarSaldo();
        atualizarSaldo();

        window.location.href = "index.html?falido=1";

        return true;
    }

    return false;
}


/* =========================================================
   BOTÃO GIRAR
   ========================================================= */

spinButton.addEventListener(
    "click",
    girar
);


/* =========================================================
   ENTER NO CAMPO DE APOSTA
   ========================================================= */

/*
    Permite apertar Enter para girar.
*/

betInput.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter"
        ) {

            girar();

        }

    }
);


/* =========================================================
   SINCRONIZAÇÃO COM OUTRAS ABAS
   ========================================================= */

/*
    Caso o jogador altere o saldo em outra aba,
    atualiza esta página automaticamente.
*/

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


        /*
            Caso o valor digitado seja maior
            que o novo saldo, ajusta a aposta.
        */

        if (
            Number(betInput.value) >
            goldAmount
        ) {

            betInput.value =
                Math.floor(goldAmount);

        }

    }
);


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

atualizarSaldo();

betInput.value =
    aposta;

/* =========================================================
VERIFICAR FALÊNCIA AO ABRIR O JOGO
========================================================= */

verificarFalencia();