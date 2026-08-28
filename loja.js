/* =========================================================
   COLECIONÁVEIS
   ========================================================= */

const colecionaveis = [

    // =====================================================
    // ADICIONE SEUS COLECIONÁVEIS AQUI
    // =====================================================

    /*
    {
        id: "coroa-dourada",

        nome: "Coroa Dourada",

        preco: 500,

        imagem: "data:image/svg+xml;base64,SEU_BASE64_AQUI"
    }
    */

];


/* =========================================================
   ELEMENTOS DA PÁGINA
   ========================================================= */

const shelf =
    document.getElementById("shelf");

const emptyMessage =
    document.getElementById("empty-message");

const goldAmountElement =
    document.getElementById("gold-amount");


/* =========================================================
   SALDO DO JOGADOR
   ========================================================= */

/*
    Recupera o saldo salvo.

    Caso ainda não exista nenhum saldo,
    começa com 1000 pepitas.
*/

let goldAmount =
    Number(
        localStorage.getItem("goldAmount")
    );


if (isNaN(goldAmount)) {

    goldAmount = 1000;

    localStorage.setItem(
        "goldAmount",
        goldAmount
    );
}


function atualizarSaldo() {

    goldAmountElement.textContent =
        goldAmount.toLocaleString("pt-BR");

}


/* =========================================================
   COMPRAS
   ========================================================= */

/*
    Recupera a lista de itens que já foram comprados.
*/

let itensComprados =
    JSON.parse(
        localStorage.getItem("itensComprados")
    );


if (!Array.isArray(itensComprados)) {

    itensComprados = [];

}


/* =========================================================
   VERIFICAR SE O ITEM JÁ FOI COMPRADO
   ========================================================= */

function itemFoiComprado(id) {

    return itensComprados.includes(id);

}


/* =========================================================
   SALVAR COMPRAS
   ========================================================= */

function salvarCompras() {

    localStorage.setItem(
        "itensComprados",
        JSON.stringify(itensComprados)
    );

}


/* =========================================================
   COMPRAR ITEM
   ========================================================= */

function comprarItem(item) {

    /*
        Impede comprar novamente
    */

    if (itemFoiComprado(item.id)) {

        return;
    }


    /*
        Verifica se o jogador
        possui pepitas suficientes
    */

    if (goldAmount < item.preco) {

        alert(
            "Você não possui pepitas suficientes!"
        );

        return;
    }


    /*
        Remove o dinheiro
    */

    goldAmount -= item.preco;


    /*
        Adiciona o item à coleção
    */

    itensComprados.push(item.id);


    /*
        Salva tudo
    */

    localStorage.setItem(
        "goldAmount",
        goldAmount
    );

    salvarCompras();


    /*
        Atualiza a interface
    */

    atualizarSaldo();

    renderizarLoja();

}


/* =========================================================
   CRIAR ITEM DA ESTANTE
   ========================================================= */

function criarItem(item) {

    const comprado =
        itemFoiComprado(item.id);


    /*
        CARD
    */

    const card =
        document.createElement("article");

    card.className =
        "collectible";


    /* =====================================================
       ÁREA DA IMAGEM
       ===================================================== */

    const display =
        document.createElement("div");

    display.className =
        "collectible-display";


    if (comprado) {

        /*
            ITEM JÁ COMPRADO
        */

        const imagem =
            document.createElement("img");

        imagem.src =
            item.imagem;

        imagem.alt =
            item.nome;

        display.appendChild(
            imagem
        );

    } else {

        /*
            ITEM NÃO COMPRADO
        */

        const purchaseArea =
            document.createElement("div");

        purchaseArea.className =
            "purchase-area";


        const lockIcon =
            document.createElement("div");

        lockIcon.className =
            "lock-icon";

        lockIcon.textContent =
            "◆";


        const purchaseText =
            document.createElement("span");

        purchaseText.className =
            "purchase-text";

        purchaseText.textContent =
            "ITEM DISPONÍVEL";


        purchaseArea.appendChild(
            lockIcon
        );

        purchaseArea.appendChild(
            purchaseText
        );


        display.appendChild(
            purchaseArea
        );

    }


    /* =====================================================
       INFORMAÇÕES
       ===================================================== */

    const info =
        document.createElement("div");

    info.className =
        "collectible-info";


    /*
        NOME
    */

    const name =
        document.createElement("h2");

    name.className =
        "collectible-name";

    name.textContent =
        item.nome;


    /*
        PREÇO
    */

    const price =
        document.createElement("p");

    price.className =
        "collectible-price";

    price.innerHTML =
        `Preço: <span>${item.preco.toLocaleString("pt-BR")} ◆</span>`;


    info.appendChild(
        name
    );

    info.appendChild(
        price
    );


    /*
        BOTÃO
    */

    if (!comprado) {

        const buyButton =
            document.createElement("button");

        buyButton.className =
            "buy-button";

        buyButton.textContent =
            "COMPRAR";


        buyButton.addEventListener(
            "click",
            () => {

                comprarItem(item);

            }
        );


        info.appendChild(
            buyButton
        );

    }


    /* =====================================================
       FINALIZAÇÃO
       ===================================================== */

    card.appendChild(
        display
    );

    card.appendChild(
        info
    );


    return card;

}


/* =========================================================
   RENDERIZAR ESTANTE
   ========================================================= */

function renderizarLoja() {

    /*
        Limpa a estante
    */

    shelf.innerHTML = "";


    /*
        Nenhum item cadastrado
    */

    if (colecionaveis.length === 0) {

        emptyMessage.style.display =
            "block";

        return;

    }


    /*
        Existem itens
    */

    emptyMessage.style.display =
        "none";


    /*
        Cria cada item
    */

    colecionaveis.forEach(
        item => {

            const elemento =
                criarItem(item);

            shelf.appendChild(
                elemento
            );

        }
    );

}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

atualizarSaldo();

renderizarLoja();