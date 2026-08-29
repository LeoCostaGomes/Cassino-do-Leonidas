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

const boardFrame =
    document.querySelector(".board-frame");

const multiplierElements =
    document.querySelectorAll(".multiplier");


/* =========================================================
   CONFIGURAÇÕES DE FÍSICA
   ========================================================= */

/*
    GRAVIDADE

    Quanto maior:
        → a bola cai mais rápido
        → as colisões acontecem em maior velocidade

    Quanto menor:
        → queda mais lenta
        → movimento mais "flutuante"
*/

const GRAVIDADE =
    1050;


/*
    VELOCIDADE INICIAL

    Pequena velocidade vertical inicial para
    a bola começar a cair suavemente.
*/

const VELOCIDADE_INICIAL_Y =
    60;


/*
    PEQUENA VARIAÇÃO HORIZONTAL INICIAL.

    Isso impede que a bola fique completamente
    previsível quando lançada exatamente no centro.
*/

const VARIACAO_INICIAL_X =
    35;


/*
    RESTITUIÇÃO.

    Define quanto da velocidade é mantida
    depois de bater em um pino.

    1.0 = quique muito forte
    0.0 = praticamente sem quique

    0.6 ~ 0.7 costuma ficar bom.
*/

const RESTITUICAO =
    0.68;


/*
    ATRITO.

    Reduz um pouco a velocidade horizontal
    quando ocorre uma colisão.
*/

const ATRITO_COLISAO =
    0.88;


/*
    ALEATORIEDADE DAS COLISÕES.

    Quanto maior:
        → mais imprevisível

    Quanto menor:
        → mais o ponto escolhido influencia
          o resultado.

    Recomendo começar entre 25 e 50.
*/

const ALEATORIEDADE_COLISAO =
    35;


/*
    VELOCIDADE MÁXIMA.

    Evita que a bola acelere demais.
*/

const VELOCIDADE_MAXIMA =
    950;


/*
    VELOCIDADE MÍNIMA DE DESCIDA.

    Impede a bola de ficar presa entre
    dois pinos por muito tempo.
*/

const VELOCIDADE_MINIMA_DESCIDA =
    90;


/*
    QUANTIDADE DE SUBPASSOS DE FÍSICA.

    Mais subpassos:
        → colisões mais precisas
        → maior custo de processamento

    3 é um bom equilíbrio.
*/

const SUBPASSOS_FISICA =
    3;


/* =========================================================
   TAMANHO DA BOLA
   ========================================================= */

const RAIO_BOLA =
    12;


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

let aposta =
    25;


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

        if (dropButton.disabled) {
            return;
        }


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

const LINHAS =
    10;


/*
    Multiplicadores das nove casas finais.
*/

const multiplicadores = [

    0.75,
    1.5,
    0.5,
    0.2,
    5,
    0.2,
    0.5,
    1.5,
    0.75

];


/* =========================================================
   ESTADO DO JOGO
   ========================================================= */


/*
    Posição escolhida pelo jogador.

    Valor entre 0 e 100%.

    null = nenhuma posição escolhida.
*/

let posicaoEscolhida =
    null;


/*
    Indica se existe uma bola em movimento.
*/

let bolaEmMovimento =
    false;


/*
    Lista com a posição física de cada pino.
*/

let pegsFisicos =
    [];


/*
    Marcador visual da posição escolhida.
*/

let marcadorLancamento =
    null;


/* =========================================================
   CRIAR PINOS
   ========================================================= */

function criarTabuleiro() {

    plinkoBoard.innerHTML =
        "";


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
                (coluna + 0.5) *
                espacamentoX;


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


    atualizarFisicaDosPinos();

}


/* =========================================================
   OBTER POSIÇÃO FÍSICA DOS PINOS
   ========================================================= */

function atualizarFisicaDosPinos() {

    pegsFisicos =
        [];


    const boardRect =
        boardFrame.getBoundingClientRect();


    const pegElements =
        plinkoBoard.querySelectorAll(".peg");


    pegElements.forEach(
        function (peg) {

            const rect =
                peg.getBoundingClientRect();


            pegsFisicos.push({

                x:
                    rect.left -
                    boardRect.left +
                    rect.width / 2,

                y:
                    rect.top -
                    boardRect.top +
                    rect.height / 2,

                raio:
                    rect.width / 2

            });

        }
    );

}


/* =========================================================
   POSICIONAR BOLA
   ========================================================= */

function posicionarBola(
    x,
    y
) {

    plinkoBall.style.left =
        `${x}px`;


    plinkoBall.style.top =
        `${y}px`;

}


/* =========================================================
   CRIAR MARCADOR DE LANÇAMENTO
   ========================================================= */

function criarMarcadorLancamento() {

    if (marcadorLancamento) {
        return;
    }


    marcadorLancamento =
        document.createElement("div");


    marcadorLancamento.className =
        "drop-marker";


    boardFrame.appendChild(
        marcadorLancamento
    );

}


/* =========================================================
   ATUALIZAR MARCADOR
   ========================================================= */

function atualizarMarcadorLancamento() {

    if (
        posicaoEscolhida === null
    ) {

        return;

    }


    criarMarcadorLancamento();


    marcadorLancamento.style.left =
        `${posicaoEscolhida}%`;


    marcadorLancamento.style.opacity =
        "1";

}


/* =========================================================
   ESCOLHER POSIÇÃO
   ========================================================= */

boardFrame.addEventListener(
    "click",
    function (event) {

        /*
            Não permite escolher outra posição
            enquanto uma bola estiver caindo.
        */

        if (bolaEmMovimento) {
            return;
        }


        /*
            Ignora cliques na parte inferior
            que estejam sobre controles.
        */

        const rect =
            boardFrame.getBoundingClientRect();


        let x =
            event.clientX -
            rect.left;


        /*
            Mantém dentro do tabuleiro.
        */

        x =
            Math.max(
                RAIO_BOLA,
                Math.min(
                    rect.width -
                    RAIO_BOLA,
                    x
                )
            );


        /*
            Converte para porcentagem.
        */

        posicaoEscolhida =
            (
                x /
                rect.width
            ) *
            100;


        atualizarMarcadorLancamento();


        mostrarMensagem(
            "POSIÇÃO ESCOLHIDA! CLIQUE EM SOLTAR.",
            ""
        );

    }
);


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
   LIMPAR MULTIPLICADORES
   ========================================================= */

function limparMultiplicadores() {

    multiplierElements.forEach(
        function (element) {

            element.classList.remove(
                "active"
            );

        }
    );

}


/* =========================================================
   DESTACAR MULTIPLICADOR
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
   COLISÃO COM PINO
   ========================================================= */

function verificarColisoes(
    bola
) {

    for (
        const peg of pegsFisicos
    ) {

        const dx =
            bola.x -
            peg.x;


        const dy =
            bola.y -
            peg.y;


        const distancia =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        const distanciaMinima =
            RAIO_BOLA +
            peg.raio;


        /*
            Não houve colisão.
        */

        if (
            distancia >=
            distanciaMinima
        ) {

            continue;

        }


        /*
            Evita divisão por zero
            caso a bola esteja exatamente
            no centro do pino.
        */

        let normalX =
            dx /
            (distancia || 1);


        let normalY =
            dy /
            (distancia || 1);


        /*
            Empurra a bola para fora do pino.

            Isso evita que ela fique presa
            dentro da colisão.
        */

        const penetracao =
            distanciaMinima -
            distancia;


        bola.x +=
            normalX *
            penetracao;


        bola.y +=
            normalY *
            penetracao;


        /*
            Calcula a velocidade na direção
            do pino.
        */

        const velocidadeNormal =
            bola.vx *
            normalX +
            bola.vy *
            normalY;


        /*
            Só rebate se estiver indo em
            direção ao pino.

            Isso evita múltiplos rebotes
            desnecessários.
        */

        if (
            velocidadeNormal < 0
        ) {

            bola.vx -=
                (
                    1 +
                    RESTITUICAO
                ) *
                velocidadeNormal *
                normalX;


            bola.vy -=
                (
                    1 +
                    RESTITUICAO
                ) *
                velocidadeNormal *
                normalY;

        }


        /*
            Pequena perda de velocidade
            horizontal.
        */

        bola.vx *=
            ATRITO_COLISAO;


        /*
            Aleatoriedade.

            O jogador escolhe a posição,
            mas nunca consegue prever
            exatamente todos os impactos.
        */

        bola.vx +=
            (
                Math.random() -
                0.5
            ) *
            2 *
            ALEATORIEDADE_COLISAO;


        /*
            Garante que a bola continue
            descendo razoavelmente.
        */

        if (
            bola.vy <
            VELOCIDADE_MINIMA_DESCIDA
        ) {

            bola.vy =
                VELOCIDADE_MINIMA_DESCIDA;

        }

    }

}


/* =========================================================
   LIMITAR VELOCIDADE
   ========================================================= */

function limitarVelocidade(
    bola
) {

    const velocidade =
        Math.sqrt(
            bola.vx * bola.vx +
            bola.vy * bola.vy
        );


    if (
        velocidade <=
        VELOCIDADE_MAXIMA
    ) {

        return;

    }


    const fator =
        VELOCIDADE_MAXIMA /
        velocidade;


    bola.vx *=
        fator;


    bola.vy *=
        fator;

}


/* =========================================================
   COLISÃO COM AS PAREDES
   ========================================================= */

function verificarParedes(
    bola,
    largura,
    altura
) {

    /*
        Parede esquerda.
    */

    if (
        bola.x <
        RAIO_BOLA
    ) {

        bola.x =
            RAIO_BOLA;


        bola.vx =
            Math.abs(
                bola.vx
            ) *
            RESTITUICAO;

    }


    /*
        Parede direita.
    */

    if (
        bola.x >
        largura -
        RAIO_BOLA
    ) {

        bola.x =
            largura -
            RAIO_BOLA;


        bola.vx =
            -Math.abs(
                bola.vx
            ) *
            RESTITUICAO;

    }


    /*
        Não deixa a bola parar completamente
        na horizontal.
    */

    if (
        Math.abs(
            bola.vx
        ) < 5
    ) {

        bola.vx +=
            (
                Math.random() -
                0.5
            ) *
            10;

    }


    /*
        Parede inferior.

        Quando chegar aqui, consideramos
        que encontrou uma casa final.
    */

    if (
        bola.y >
        altura -
        RAIO_BOLA
    ) {

        bola.y =
            altura -
            RAIO_BOLA;

        return true;

    }


    return false;

}


/* =========================================================
   DETERMINAR CASA FINAL
   ========================================================= */

function obterResultadoPorX(
    x,
    largura
) {

    /*
        Divide o tabuleiro em nove regiões.
    */

    const larguraCasa =
        largura /
        multiplicadores.length;


    let resultado =
        Math.floor(
            x /
            larguraCasa
        );


    resultado =
        Math.max(
            0,
            Math.min(
                multiplicadores.length - 1,
                resultado
            )
        );


    return resultado;

}


/* =========================================================
   ANIMAÇÃO FÍSICA
   ========================================================= */

function animarBolaFisica() {

    return new Promise(
        function (resolve) {

            const rect =
                boardFrame.getBoundingClientRect();


            const largura =
                rect.width;


            const altura =
                rect.height;


            /*
                Converte a posição escolhida
                em pixels.
            */

            const xInicial =
                (
                    posicaoEscolhida /
                    100
                ) *
                largura;


            /*
                Estado físico da bola.
            */

            const bola = {

                x:
                    xInicial,

                y:
                    RAIO_BOLA + 2,

                vx:
                    (
                        Math.random() -
                        0.5
                    ) *
                    VARIACAO_INICIAL_X,

                vy:
                    VELOCIDADE_INICIAL_Y

            };


            plinkoBall.style.opacity =
                "1";


            /*
                Desativa o marcador durante
                a queda.
            */

            if (
                marcadorLancamento
            ) {

                marcadorLancamento.style.opacity =
                    "0";

            }


            let ultimoTempo =
                performance.now();


            function atualizar(
                tempoAtual
            ) {

                /*
                    Delta time.

                    Limitamos para evitar que
                    uma aba congelada cause um
                    salto enorme.
                */

                let delta =
                    (
                        tempoAtual -
                        ultimoTempo
                    ) /
                    1000;


                delta =
                    Math.min(
                        delta,
                        0.033
                    );


                ultimoTempo =
                    tempoAtual;


                const dt =
                    delta /
                    SUBPASSOS_FISICA;


                let chegouAoFinal =
                    false;


                /*
                    Executa vários pequenos passos
                    por frame para melhorar a precisão.
                */

                for (
                    let passo = 0;
                    passo < SUBPASSOS_FISICA;
                    passo++
                ) {

                    /*
                        Gravidade.
                    */

                    bola.vy +=
                        GRAVIDADE *
                        dt;


                    /*
                        Movimento.
                    */

                    bola.x +=
                        bola.vx *
                        dt;


                    bola.y +=
                        bola.vy *
                        dt;


                    /*
                        Colisões.
                    */

                    verificarColisoes(
                        bola
                    );


                    /*
                        Paredes.
                    */

                    if (
                        verificarParedes(
                            bola,
                            largura,
                            altura
                        )
                    ) {

                        chegouAoFinal =
                            true;

                        break;

                    }


                    /*
                        Limita a velocidade.
                    */

                    limitarVelocidade(
                        bola
                    );

                }


                /*
                    Atualiza visual.
                */

                posicionarBola(
                    bola.x,
                    bola.y
                );


                /*
                    Chegou no fundo.
                */

                if (
                    chegouAoFinal
                ) {

                    const resultado =
                        obterResultadoPorX(
                            bola.x,
                            largura
                        );


                    /*
                        Pequena pausa visual
                        antes de finalizar.
                    */

                    setTimeout(
                        function () {

                            plinkoBall.style.opacity =
                                "0";


                            resolve(
                                resultado
                            );

                        },
                        180
                    );


                    return;

                }


                requestAnimationFrame(
                    atualizar
                );

            }


            requestAnimationFrame(
                atualizar
            );

        }
    );

}


/* =========================================================
   SOLTAR BOLA
   ========================================================= */

async function soltarBola() {

    /*
        Impede múltiplas jogadas.
    */

    if (
        bolaEmMovimento
    ) {

        return;

    }


    /*
        Exige que o jogador escolha
        uma posição.
    */

    if (
        posicaoEscolhida === null
    ) {

        mostrarMensagem(
            "CLIQUE NO TABULEIRO PARA ESCOLHER ONDE A BOLA VAI CAIR!"
        );

        return;

    }


    /* =====================================================
       OBTER APOSTA
       ===================================================== */

    aposta =
        obterAposta();


    if (
        aposta < 1
    ) {

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

    bolaEmMovimento =
        true;


    dropButton.disabled =
        true;


    maxBetButton.disabled =
        true;


    betInput.disabled =
        true;


    boardFrame.classList.add(
        "ball-dropping"
    );


    limparMultiplicadores();


    mostrarMensagem(
        "A BOLA ESTÁ DESCENDO..."
    );


    /* =====================================================
       FÍSICA
       ===================================================== */

    const resultado =
        await animarBolaFisica();


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

    goldAmount +=
        premio;


    salvarSaldo();

    atualizarSaldo();


    /* =====================================================
       MENSAGEM
       ===================================================== */

    if (
        multiplicador === 5
    ) {

        mostrarMensagem(
            `JACKPOT! A BOLA PAROU EM 5x! +${premio.toLocaleString("pt-BR")} ◆`,
            "jackpot"
        );

    }

    else if (
        multiplicador >= 1.5
    ) {

        mostrarMensagem(
            `BOA! A BOLA PAROU EM ${multiplicador}x! +${premio.toLocaleString("pt-BR")} ◆`,
            "win"
        );

    }

    else if (
        multiplicador === 1
    ) {

        mostrarMensagem(
            `A BOLA PAROU EM 1x! VOCÊ RECUPEROU SUA APOSTA.`,
            "win"
        );

    }

    else {

        mostrarMensagem(
            `A BOLA PAROU EM ${multiplicador}x! +${premio.toLocaleString("pt-BR")} ◆`,
            "loss"
        );

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
       FINALIZAR RODADA
       ===================================================== */

    bolaEmMovimento =
        false;


    boardFrame.classList.remove(
        "ball-dropping"
    );


    dropButton.disabled =
        false;


    maxBetButton.disabled =
        false;


    betInput.disabled =
        false;


    /*
        Obriga o jogador a escolher
        uma nova posição para a próxima bola.
    */

    posicaoEscolhida =
        null;


    if (
        marcadorLancamento
    ) {

        marcadorLancamento.style.opacity =
            "0";

    }

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
   RESPONSIVIDADE DA FÍSICA
   ========================================================= */

/*
    Quando a janela muda de tamanho,
    recalcula as posições dos pinos.
*/

window.addEventListener(
    "resize",
    function () {

        if (
            !bolaEmMovimento
        ) {

            atualizarFisicaDosPinos();

        }

    }
);


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

criarTabuleiro();

atualizarSaldo();

betInput.value =
    aposta;

atualizarApostaVisual();

verificarFalencia();