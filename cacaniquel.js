/* =========================================================
   CAÇA-NÍQUEL DA FORTUNA
   ========================================================= */


/* =========================================================
   CONFIGURAÇÕES DE BALANCEAMENTO
   ========================================================= */

/*
    VELOCIDADE_GIRO_MS

    Controla a velocidade com que os símbolos mudam.

    Quanto MENOR o valor:
        → mais rápido
        → mais difícil clicar no símbolo desejado

    Quanto MAIOR o valor:
        → mais lento
        → mais fácil clicar

    Recomendações:

    60  = extremamente rápido
    70  = rápido
    80  = rápido / recomendado
    90  = médio
    100 = mais fácil
    120 = lento

    O valor abaixo é o recomendado para começar.
*/

const VELOCIDADE_GIRO_MS = 100;


/*
    Caso queira deixar cada rolo ligeiramente diferente,
    você pode ativar esta opção.

    false = todos os rolos usam a mesma velocidade
    true  = cada rolo possui uma pequena variação
*/

const VARIAR_VELOCIDADE_ROLOS = false;


/*
    Variação máxima de velocidade em milissegundos.

    Exemplo:

    VELOCIDADE_GIRO_MS = 80
    VARIACAO = 10

    Um rolo poderá girar a:
        70 ms
        80 ms
        90 ms
*/

const VARIACAO_VELOCIDADE_MS = 10;


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
        goldAmount.toLocaleString("pt-BR");

}


/* =========================================================
   CONFIGURAÇÃO DOS SÍMBOLOS
   ========================================================= */

/*
    peso:

    Quanto maior o peso, maior a frequência do símbolo.

    O peso foi calculado de forma inversamente proporcional
    ao multiplicador.

    x20 → 1/20
    x10 → 1/10
    x7  → 1/7
    x5  → 1/5
    x4  → 1/4
    x3  → 1/3

    Portanto:

        maior prêmio = menor frequência
        menor prêmio = maior frequência

    Para balancear manualmente, basta alterar os pesos aqui.
*/

const simbolos = [

    {
        id: "sete",
        visual: "7",
        premio: 20,
        peso: 1 / 20
    },

    {
        id: "diamante",
        visual: "◆",
        premio: 10,
        peso: 1 / 10
    },

    {
        id: "trevo",
        visual: "🍀",
        premio: 7,
        peso: 1 / 7
    },

    {
        id: "cereja",
        visual: "🍒",
        premio: 5,
        peso: 1 / 5
    },

    {
        id: "sino",
        visual: "🔔",
        premio: 4,
        peso: 1 / 4
    },

    {
        id: "moeda",
        visual: "●",
        premio: 3,
        peso: 1 / 3
    }

];


/*
    Quando aparecem apenas 2 símbolos iguais,
    o jogador recebe 1.5x a aposta.
*/

const DOIS_IGUAIS = 1.5;


/* =========================================================
   ESTADO DOS ROLOS
   ========================================================= */

/*
    Cada rolo possui:

        simbolo
        intervalo
        girando
        indice
*/

const estadoRolos = reels.map(
    function () {

        return {

            simbolo: null,

            intervalo: null,

            girando: false,

            indice: -1

        };

    }
);


/*
    Indica se existe uma rodada em andamento.
*/

let rodadaAtiva = false;


/*
    Quantos rolos já foram parados.
*/

let quantidadeRolosParados = 0;


/*
    Guarda a aposta atual.
*/

let aposta = 25;


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


    return Math.floor(valor);

}


/* =========================================================
   BOTÃO "APOSTAR TUDO"
   ========================================================= */

maxBetButton.addEventListener(
    "click",
    function () {

        if (rodadaAtiva) {
            return;
        }


        betInput.value =
            Math.floor(goldAmount);


        betInput.focus();

    }
);


/* =========================================================
   SÍMBOLO ALEATÓRIO COM PESO
   ========================================================= */

function obterSimboloAleatorio() {

    /*
        Soma todos os pesos.
    */

    const pesoTotal =
        simbolos.reduce(
            function (total, simbolo) {

                return total + simbolo.peso;

            },
            0
        );


    /*
        Escolhe um ponto aleatório
        dentro do peso total.
    */

    let valorAleatorio =
        Math.random() * pesoTotal;


    /*
        Percorre os símbolos
        até encontrar o intervalo.
    */

    for (const simbolo of simbolos) {

        valorAleatorio -=
            simbolo.peso;


        if (valorAleatorio <= 0) {

            return simbolo;

        }

    }


    /*
        Segurança.
    */

    return simbolos[simbolos.length - 1];

}


/* =========================================================
   VELOCIDADE DO ROLO
   ========================================================= */

function obterVelocidadeDoRolo(indice) {

    if (!VARIAR_VELOCIDADE_ROLOS) {

        return VELOCIDADE_GIRO_MS;

    }


    const variacao =
        Math.floor(
            Math.random() *
            (
                VARIACAO_VELOCIDADE_MS * 2 + 1
            )
        ) -
        VARIACAO_VELOCIDADE_MS;


    return Math.max(
        20,
        VELOCIDADE_GIRO_MS + variacao
    );

}


/* =========================================================
   MOSTRAR SÍMBOLO NO ROLO
   ========================================================= */

function mostrarSimboloNoRolo(
    indice,
    simbolo
) {

    const symbolElement =
        reels[indice].querySelector(".symbol");


    symbolElement.textContent =
        simbolo.visual;

}


/* =========================================================
   GIRAR UM ROLO
   ========================================================= */

function iniciarRolo(indice) {

    const estado =
        estadoRolos[indice];


    /*
        Impede iniciar o mesmo rolo duas vezes.
    */

    if (estado.girando) {

        return;

    }


    estado.girando = true;


    /*
        Símbolo inicial.
    */

    estado.simbolo =
        obterSimboloAleatorio();


    mostrarSimboloNoRolo(
        indice,
        estado.simbolo
    );


    /*
        Define velocidade deste rolo.
    */

    const velocidade =
        obterVelocidadeDoRolo(indice);


    /*
        Troca os símbolos continuamente.
    */

    estado.intervalo =
        setInterval(
            function () {

                if (!estado.girando) {
                    return;
                }


                estado.simbolo =
                    obterSimboloAleatorio();


                mostrarSimboloNoRolo(
                    indice,
                    estado.simbolo
                );

            },
            velocidade
        );


    /*
        Marca visualmente que está girando.
    */

    reels[indice].classList.add(
        "spinning"
    );

    reels[indice].classList.remove(
        "stopped"
    );

}


/* =========================================================
   PARAR UM ROLO
   ========================================================= */

function pararRolo(indice) {

    const estado =
        estadoRolos[indice];


    /*
        Não faz nada se o rolo
        já estiver parado.
    */

    if (!estado.girando) {

        return;

    }


    /*
        Para o intervalo.
    */

    clearInterval(
        estado.intervalo
    );


    estado.intervalo =
        null;


    estado.girando =
        false;


    quantidadeRolosParados++;


    /*
        Remove o estado visual de giro.
    */

    reels[indice].classList.remove(
        "spinning"
    );

    reels[indice].classList.add(
        "stopped"
    );


    /*
        Verifica se todos
        os rolos foram parados.
    */

    if (
        quantidadeRolosParados ===
        reels.length
    ) {

        finalizarRodada();

    }

}


/* =========================================================
   INICIAR RODADA
   ========================================================= */

function iniciarRodada() {

    aposta =
        obterAposta();


    /*
        Aposta inválida.
    */

    if (aposta < 1) {

        mostrarMensagem(
            "DIGITE UMA APOSTA VÁLIDA!"
        );

        betInput.focus();

        return;

    }


    /*
        Saldo insuficiente.
    */

    if (aposta > goldAmount) {

        mostrarMensagem(
            "VOCÊ NÃO POSSUI PEPITAS SUFICIENTES!"
        );

        betInput.focus();

        return;

    }


    /*
        Desconta a aposta.
    */

    goldAmount -= aposta;


    salvarSaldo();
    atualizarSaldo();


    /*
        Inicia estado da rodada.
    */

    rodadaAtiva = true;

    quantidadeRolosParados = 0;


    /*
        Desabilita controles gerais.
    */

    spinButton.disabled = true;

    maxBetButton.disabled = true;

    betInput.disabled = true;


    /*
        Atualiza mensagem.
    */

    mostrarMensagem(
        "CLIQUE NOS ROLOS PARA PARÁ-LOS!"
    );


    /*
        Inicia os três rolos.
    */

    reels.forEach(
        function (_, indice) {

            iniciarRolo(indice);

        }
    );

}


/* =========================================================
   FINALIZAR RODADA
   ========================================================= */

function finalizarRodada() {

    rodadaAtiva = false;


    /*
        Monta o resultado final
        usando os símbolos onde os rolos pararam.
    */

    const resultados =
        estadoRolos.map(
            function (estado) {

                return estado.simbolo;

            }
        );


    /*
        Calcula prêmio.
    */

    const premio =
        calcularPremio(
            resultados
        );


    /*
        Mostra último prêmio.
    */

    lastWinElement.textContent =
        `Último prêmio: ${premio.toLocaleString("pt-BR")} ◆`;


    /*
        Jogador ganhou.
    */

    if (premio > 0) {

        goldAmount += premio;


        salvarSaldo();
        atualizarSaldo();


        /*
            JACKPOT
        */

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

        mostrarMensagem(
            "NÃO FOI DESSA VEZ...",
            "loss"
        );

    }


    /*
        Verifica falência depois
        de contabilizar o prêmio.
    */

    if (goldAmount <= 0) {

        goldAmount = 0;


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


    /*
        Libera os controles.
    */

    spinButton.disabled = false;

    maxBetButton.disabled = false;

    betInput.disabled = false;

}


/* =========================================================
   CALCULAR PRÊMIO
   ========================================================= */

function calcularPremio(resultado) {

    const primeiro =
        resultado[0];

    const segundo =
        resultado[1];

    const terceiro =
        resultado[2];


    /*
        3 IGUAIS
    */

    if (
        primeiro.id === segundo.id &&
        segundo.id === terceiro.id
    ) {

        return Math.floor(
            aposta *
            primeiro.premio
        );

    }


    /*
        2 IGUAIS
    */

    if (
        primeiro.id === segundo.id ||
        primeiro.id === terceiro.id ||
        segundo.id === terceiro.id
    ) {

        return Math.floor(
            aposta *
            DOIS_IGUAIS
        );

    }


    /*
        NENHUM PRÊMIO
    */

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


    resultMessage.className =
        "result-message";


    if (tipo !== "") {

        resultMessage.classList.add(
            tipo
        );

    }

}


/* =========================================================
   CLIQUE NO BOTÃO GIRAR
   ========================================================= */

spinButton.addEventListener(
    "click",
    function () {

        /*
            Caso não exista rodada,
            começa uma nova.
        */

        if (!rodadaAtiva) {

            iniciarRodada();

        }

    }
);


/* =========================================================
   CLIQUE NOS ROLOS
   ========================================================= */

/*
    Cada rolo pode ser clicado individualmente.

    Exemplo:

        GIRAR

        [ 7 ] [ ◆ ] [ 🍒 ]
          ↑
        clique

        [ 7 ] fica parado

        os outros continuam girando
*/

reels.forEach(
    function (reel, indice) {

        reel.addEventListener(
            "click",
            function () {

                /*
                    Só permite parar o rolo
                    durante uma rodada.
                */

                if (!rodadaAtiva) {

                    return;

                }


                pararRolo(indice);

            }
        );


        /*
            Melhora a indicação de que
            o rolo é clicável.
        */

        reel.setAttribute(
            "role",
            "button"
        );

        reel.setAttribute(
            "tabindex",
            "0"
        );


        /*
            Também permite usar Enter
            ou Espaço no rolo.
        */

        reel.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key !== "Enter" &&
                    event.key !== " "
                ) {

                    return;

                }


                event.preventDefault();


                if (!rodadaAtiva) {

                    return;

                }


                pararRolo(indice);

            }
        );

    }
);


/* =========================================================
   ENTER NO CAMPO DE APOSTA
   ========================================================= */

betInput.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter"
        ) {

            if (!rodadaAtiva) {

                iniciarRodada();

            }

        }

    }
);


/* =========================================================
   SINCRONIZAÇÃO COM OUTRAS ABAS
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
            Number(betInput.value) >
            goldAmount
        ) {

            betInput.value =
                Math.floor(goldAmount);

        }

    }
);


/* =========================================================
   VERIFICAR FALÊNCIA
   ========================================================= */

function verificarFalencia() {

    if (goldAmount <= 0) {

        goldAmount = 0;

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

atualizarSaldo();

betInput.value =
    aposta;


verificarFalencia();