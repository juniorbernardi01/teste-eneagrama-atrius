// ======================================================
//  ARMAZENAMENTO DAS RESPOSTAS
// ======================================================

// Salva uma resposta por vez E marca visualmente a opção escolhida
function salvarResposta(pergunta, alternativa, elemento) {
    let respostas = JSON.parse(localStorage.getItem("respostas")) || [];

    // remove resposta anterior dessa mesma pergunta (se tiver)
    respostas = respostas.filter(r => r.pergunta !== pergunta);

    // adiciona a nova resposta
    respostas.push({
        pergunta: pergunta,
        alternativa: alternativa
    });

    localStorage.setItem("respostas", JSON.stringify(respostas));

    // --- PARTE VISUAL: marcar o botão selecionado ---
    if (elemento) {
        // pega o card da pergunta
        const card = elemento.closest('.question-card');
        if (card) {
            // remove a seleção de todos os botões dessa pergunta
            const botoes = card.querySelectorAll('.option-btn');
            botoes.forEach(btn => btn.classList.remove('selected'));
        }
        // marca só o clicado
        elemento.classList.add('selected');
    }
}

// Limpa respostas quando inicia o teste
function iniciarTeste() {
    localStorage.removeItem("respostas");
    window.location.href = "pages/page1.html";
}


// ======================================================
//  CARREGAR MATRIZ DE PONTUAÇÃO
// ======================================================

async function carregarMatriz() {
    const matriz = await fetch("../data/matriz.json").then(r => r.json());
    return matriz;
}


// ======================================================
//  CALCULAR RESULTADO FINAL
// ======================================================

async function calcularResultado() {
    const matriz = await carregarMatriz();

    // pontuação dos 9 perfis
    let score = {
        1: 0, 2: 0, 3: 0,
        4: 0, 5: 0, 6: 0,
        7: 0, 8: 0, 9: 0
    };

    const respostas = JSON.parse(localStorage.getItem("respostas")) || [];

    respostas.forEach(r => {
        const perfil = matriz[r.pergunta][r.alternativa];
        if (perfil) {
            score[perfil] += 1;
        }
    });

    // salva o resultado bruto
    localStorage.setItem("resultado", JSON.stringify(score));

    // envia para página final
    window.location.href = "resultado.html";
}


// ======================================================
//  FUNÇÃO PARA PEGAR OS 3 PERFIS PRINCIPAIS
// ======================================================

function obterTop3(score) {
    const ordenado = Object.entries(score)
        .sort((a, b) => b[1] - a[1])  // ordena do maior para o menor
        .slice(0, 3);                 // pega os 3 primeiros

    return ordenado.map(item => ({
        perfil: item[0],
        pontos: item[1]
    }));
}


// ======================================================
//  CARREGAR RESULTADO NA PÁGINA FINAL
// ======================================================

function carregarResultadoNaPagina() {
    const score = JSON.parse(localStorage.getItem("resultado"));
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    const top3 = obterTop3(score);

    console.log("Resultado completo:", score);
    console.log("Top 3:", top3);

    // aqui depois a gente preenche o HTML da página de resultado
}
