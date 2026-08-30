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

const plinkoStage =
    document.getElementById("plinko-stage");

const multiplierElements =
    document.querySelectorAll(".multiplier");


/* =========================================================
   TAMANHO LÓGICO DO TABULEIRO
   ========================================================= */

/*
    O tabuleiro possui sempre estas dimensões
    internamente.

    Em celulares ele apenas é visualmente
    reduzido.

    A física nunca depende do tamanho da tela.
*/

const BOARD_WIDTH =
    640;

const BOARD_HEIGHT =
    430;


/* =========================================================
   CONFIGURAÇÃO DO TABULEIRO
   ========================================================= */

const LINHAS =
    10;


/*
    Quantidade de pinos.

    Usamos uma quantidade alta para que
    os pinos ocupem praticamente toda
    a largura do tabuleiro.

    Alternamos 14 / 13 para formar
    o padrão intercalado.
*/

const PINOS_FILEIRA_A =
    14;

const PINOS_FILEIRA_B =
    13;


/*
    Distância fixa entre os pinos.

    Essa distância NUNCA muda com a
    resolução da tela.
*/

const ESPACAMENTO_X =
    46;


/*
    Espaçamento vertical.
*/

const ESPACAMENTO_Y =
    38;


/*
    Primeiro pino.
*/

const PRIMEIRO_Y =
    35;


/* =========================================================
   CONFIGURAÇÕES DA FÍSICA
   ========================================================= */

/*
    GRAVIDADE
*/

const GRAVIDADE =
    1080;


/*
    Velocidade vertical inicial.
*/

const VELOCIDADE_INICIAL_Y =
    70;


/*
    Pequena variação horizontal no lançamento.

    Mantida baixa para que a posição escolhida
    pelo jogador continue sendo importante.
*/

const VARIACAO_INICIAL_X =
    18;

const MARGEM_LANCAMENTO = 70;
/*
    Força do quique.

    0.0 = sem quique
    1.0 = quique muito forte
*/

const RESTITUICAO =
    0.64;


/*
    Atrito horizontal.
*/

const ATRITO_COLISAO =
    0.91;


/*
    Pequena aleatoriedade nas colisões.

    Não aumentamos isso para resolver
    problemas de geometria.

    Ela serve apenas para evitar trajetórias
    perfeitamente idênticas.
*/

const ALEATORIEDADE_COLISAO =
    18;


/*
    Pequena variação tangencial.

    Também mantida baixa.
*/

const VARIACAO_TANGENCIAL =
    10;


/*
    Velocidade máxima.
*/

const VELOCIDADE_MAXIMA =
    950;


/*
    Velocidade vertical mínima.

    Evita que a bola fique presa.
*/

const VELOCIDADE_MINIMA_DESCIDA =
    80;


/*
    Subpassos de física.

    Mais precisão nas colisões.
*/

const SUBPASSOS_FISICA =
    4;


/* =========================================================
   TAMANHO DA BOLA
   ========================================================= */

const RAIO_BOLA =
    12;


/* =========================================================
   MULTIPLICADORES
   ========================================================= */

const multiplicadores = [

    0.5,
    1.5,
    0.5,
    0.2,
    3,
    0.2,
    0.5,
    1.5,
    0.5

];


/* =========================================================
   SISTEMA DE PEPITAS
   ========================================================= */

function obterSaldo() {

    const saldoSalvo =
        localStorage.getItem(
            "goldAmount"
        );


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


    return Math.floor(
        valor
    );

}


/* =========================================================
   ATUALIZAR APOSTA VISUAL
   ========================================================= */

function atualizarApostaVisual() {

    const valor =
        obterAposta();


    if (
        valor < 1
    ) {

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

        if (
            bolaEmMovimento
        ) {

            return;

        }


        betInput.value =
            Math.floor(
                goldAmount
            );


        atualizarApostaVisual();


        betInput.focus();

    }
);


/* =========================================================
   INPUT DA APOSTA
   ========================================================= */

betInput.addEventListener(
    "input",
    function () {

        atualizarApostaVisual();

    }
);


/* =========================================================
   ESTADO DO JOGO
   ========================================================= */

let posicaoEscolhida =
    null;


let bolaEmMovimento =
    false;


let pegsFisicos =
    [];


let marcadorLancamento =
    null;


/* =========================================================
   CRIAR TABULEIRO
   ========================================================= */

function criarTabuleiro() {

    plinkoBoard.innerHTML =
        "";


    pegsFisicos =
        [];


    /*
        Criamos fileiras alternadas.

        A geometria é completamente fixa.

        Nenhum valor depende da largura
        atual da tela.
    */

    for (
        let linha = 0;
        linha < LINHAS;
        linha++
    ) {

        const quantidade =
            linha % 2 === 0
                ? PINOS_FILEIRA_A
                : PINOS_FILEIRA_B;


        /*
            Largura ocupada pela fileira.
        */

        const larguraLinha =
            (
                quantidade - 1
            ) *
            ESPACAMENTO_X;


        /*
            Centraliza a fileira.
        */

        const inicioX =
            (
                BOARD_WIDTH -
                larguraLinha
            ) / 2;


        const y =
            PRIMEIRO_Y +
            linha *
            ESPACAMENTO_Y;


        for (
            let coluna = 0;
            coluna < quantidade;
            coluna++
        ) {

            const x =
                inicioX +
                coluna *
                ESPACAMENTO_X;


            const peg =
                document.createElement(
                    "div"
                );


            peg.className =
                "peg";


            peg.style.left =
                `${x}px`;


            peg.style.top =
                `${y}px`;


            plinkoBoard.appendChild(
                peg
            );

        }

    }


    atualizarFisicaDosPinos();

}


/* =========================================================
   POSIÇÃO DOS PINOS PARA A FÍSICA
   ========================================================= */

function atualizarFisicaDosPinos() {

    pegsFisicos =
        [];


    const pegElements =
        plinkoBoard.querySelectorAll(
            ".peg"
        );


    pegElements.forEach(
        function (peg) {

            pegsFisicos.push({

                x:
                    parseFloat(
                        peg.style.left
                    ),

                y:
                    parseFloat(
                        peg.style.top
                    ),

                raio:
                    6

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
   CRIAR MARCADOR
   ========================================================= */

function criarMarcadorLancamento() {

    if (
        marcadorLancamento
    ) {

        return;

    }


    marcadorLancamento =
        document.createElement(
            "div"
        );


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
   ESCOLHER POSIÇÃO DE LANÇAMENTO
   ========================================================= */

boardFrame.addEventListener(
    "click",
    function (event) {

        if (
            bolaEmMovimento
        ) {

            return;

        }


        /*
            Pegamos a posição visual
            do stage.
        */

        const stageRect =
            plinkoStage.getBoundingClientRect();


        /*
            Calculamos a escala visual.

            Exemplo:

            stage lógico = 640px
            stage visual = 320px

            escala = 0.5
        */

        const escala =
            stageRect.width /
            BOARD_WIDTH;


        /*
            Converte o clique da tela
            para o sistema lógico de 640px.
        */

        let x =
            (
                event.clientX -
                stageRect.left
            ) /
            escala;


        /*
            Limita a posição inicial.
        */

        x =
            Math.max(
                MARGEM_LANCAMENTO,
                Math.min(
                    BOARD_WIDTH -
                    MARGEM_LANCAMENTO,
                    x
                )
            );


        /*
            Guarda em porcentagem.
        */

        posicaoEscolhida =
            (
                x /
                BOARD_WIDTH
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
   COLISÃO COM OS PINOS
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


        const distanciaQuadrada =
            dx * dx +
            dy * dy;


        const distancia =
            Math.sqrt(
                distanciaQuadrada
            );


        const distanciaMinima =
            RAIO_BOLA +
            peg.raio;


        /*
            Não colidiu.
        */

        if (
            distancia >=
            distanciaMinima
        ) {

            continue;

        }


        /*
            Normal da colisão.
        */

        let normalX;
        let normalY;


        if (
            distancia < 0.001
        ) {

            /*
                Caso extremamente raro:
                a bola está exatamente no centro
                do pino.

                Escolhemos uma direção pequena
                apenas para desempatar.
            */

            const angulo =
                Math.random() *
                Math.PI *
                2;


            normalX =
                Math.cos(
                    angulo
                );


            normalY =
                Math.sin(
                    angulo
                );

        }

        else {

            normalX =
                dx /
                distancia;


            normalY =
                dy /
                distancia;

        }


        /*
            Retira a bola de dentro do pino.
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
            Velocidade na direção
            da normal.
        */

        const velocidadeNormal =
            bola.vx *
            normalX +
            bola.vy *
            normalY;


        /*
            Apenas rebate se a bola estiver
            se aproximando do pino.
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
            ATRITO
        */

        bola.vx *=
            ATRITO_COLISAO;


        /*
            PEQUENA VARIAÇÃO ALEATÓRIA

            É propositalmente baixa.

            Ela não existe para decidir
            o prêmio, apenas para evitar
            trajetórias perfeitamente idênticas.
        */

        bola.vx +=
            (
                Math.random() -
                0.5
            ) *
            2 *
            ALEATORIEDADE_COLISAO;


        /*
            Pequena componente tangencial.
        */

        const tangenteX =
            -normalY;


        const tangenteY =
            normalX;


        const impulsoTangencial =
            (
                Math.random() -
                0.5
            ) *
            2 *
            VARIACAO_TANGENCIAL;


        bola.vx +=
            tangenteX *
            impulsoTangencial;


        bola.vy +=
            tangenteY *
            impulsoTangencial;


        /*
            Garante que a bola
            continue descendo.
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
   PAREDES COM TELETRANSPORTE
   ========================================================= */

function verificarLimitesHorizontais(
    bola,
    largura
) {

    /*
        IMPORTANTE:

        Não existem paredes laterais.

        Se a bola sair pela esquerda,
        entra pela direita.

        Se sair pela direita,
        entra pela esquerda.

        Isso cria um espaço horizontal
        contínuo.
    */

    if (
        bola.x < -RAIO_BOLA
    ) {

        bola.x =
            largura +
            RAIO_BOLA;

    }


    if (
        bola.x >
        largura +
        RAIO_BOLA
    ) {

        bola.x =
            -RAIO_BOLA;

    }

}


/* =========================================================
   VERIFICAR FUNDO
   ========================================================= */

function verificarLimiteInferior(
    bola,
    altura
) {

    if (
        bola.y >=
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
   DETERMINAR RESULTADO
   ========================================================= */

function obterResultadoPorX(
    x
) {

    const larguraCasa =
        BOARD_WIDTH /
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

            /*
                Sempre usamos o tamanho
                lógico do tabuleiro.
            */

            const largura =
                BOARD_WIDTH;


            const altura =
                BOARD_HEIGHT;


            /*
                Posição inicial escolhida.
            */

            const xInicial =
                (
                    posicaoEscolhida /
                    100
                ) *
                BOARD_WIDTH;


            /*
                Estado físico da bola.
            */

            const bola = {

                x:
                    xInicial,

                y:
                    RAIO_BOLA +
                    2,

                vx:
                    (
                        Math.random() -
                        0.5
                    ) *
                    VARIACAO_INICIAL_X,

                vy:
                    VELOCIDADE_INICIAL_Y

            };


            /*
                Mostra a bola.
            */

            plinkoBall.style.opacity =
                "1";


            /*
                Esconde o marcador.
            */

            if (
                marcadorLancamento
            ) {

                marcadorLancamento.style.opacity =
                    "0";

            }


            /*
                Tempo do último frame.
            */

            let ultimoTempo =
                performance.now();


            /*
                LOOP DE FÍSICA
            */

            function atualizar(
                tempoAtual
            ) {

                /*
                    Delta time em segundos.
                */

                let delta =
                    (
                        tempoAtual -
                        ultimoTempo
                    ) /
                    1000;


                /*
                    Evita saltos enormes
                    caso o navegador trave
                    momentaneamente.
                */

                delta =
                    Math.min(
                        delta,
                        0.033
                    );


                ultimoTempo =
                    tempoAtual;


                /*
                    Divide o frame.
                */

                const dt =
                    delta /
                    SUBPASSOS_FISICA;


                let chegouAoFinal =
                    false;


                /*
                    Subpassos físicos.
                */

                for (
                    let passo = 0;
                    passo <
                    SUBPASSOS_FISICA;
                    passo++
                ) {

                    /*
                        GRAVIDADE
                    */

                    bola.vy +=
                        GRAVIDADE *
                        dt;


                    /*
                        MOVIMENTO
                    */

                    bola.x +=
                        bola.vx *
                        dt;


                    bola.y +=
                        bola.vy *
                        dt;


                    /*
                        COLISÕES
                    */

                    verificarColisoes(
                        bola
                    );


                    /*
                        TELETRANSPORTE
                        DAS LATERAIS
                    */

                    verificarLimitesHorizontais(
                        bola,
                        largura
                    );


                    /*
                        FUNDO
                    */

                    if (
                        verificarLimiteInferior(
                            bola,
                            altura
                        )
                    ) {

                        chegouAoFinal =
                            true;

                        break;

                    }


                    /*
                        VELOCIDADE
                    */

                    limitarVelocidade(
                        bola
                    );

                }


                /*
                    Atualiza a posição visual.
                */

                posicionarBola(
                    bola.x,
                    bola.y
                );


                /*
                    Finalizou.
                */

                if (
                    chegouAoFinal
                ) {

                    const resultado =
                        obterResultadoPorX(
                            bola.x
                        );


                    /*
                        Mostra a bola rapidamente
                        antes de desaparecer.
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


                /*
                    Próximo frame.
                */

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


    if (
        tipo !== ""
    ) {

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
        Impede outra jogada simultânea.
    */

    if (
        bolaEmMovimento
    ) {

        return;

    }


    /*
        É obrigatório escolher uma posição.
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
       APOSTA
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
       SALDO
       ===================================================== */

    if (
        aposta >
        goldAmount
    ) {

        mostrarMensagem(
            "VOCÊ NÃO POSSUI PEPITAS SUFICIENTES!"
        );

        betInput.focus();

        return;

    }


    /* =====================================================
       DESCONTAR
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
       DESTACAR
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
       FALÊNCIA
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
       LIBERAR
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
        Obriga uma nova posição.
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
            event.key !==
            "goldAmount"
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
   RESPONSIVIDADE
   ========================================================= */

function atualizarEscalaTabuleiro() {

    if (
        !plinkoStage ||
        !boardFrame
    ) {

        return;

    }


    const larguraDisponivel =
        boardFrame.clientWidth;


    const alturaDisponivel =
        boardFrame.clientHeight;


    const escalaHorizontal =
        larguraDisponivel /
        BOARD_WIDTH;


    const escalaVertical =
        alturaDisponivel /
        BOARD_HEIGHT;


    /*
        Escolhe a menor escala.

        O stage mantém sua geometria.
    */

    const escala =
        Math.min(
            escalaHorizontal,
            escalaVertical
        );


    plinkoStage.style.transform =
        `
        translate(-50%, -50%)
        scale(${escala})
        `;

}


window.addEventListener(
    "resize",
    function () {

        atualizarEscalaTabuleiro();

    }
);


/* =========================================================
   FALÊNCIA
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

atualizarEscalaTabuleiro();

atualizarSaldo();

betInput.value =
    aposta;

atualizarApostaVisual();

verificarFalencia();