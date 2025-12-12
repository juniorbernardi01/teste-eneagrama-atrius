// ======================================================
//  ARMAZENAMENTO DAS RESPOSTAS
// ======================================================

// Salva uma resposta por vez
function salvarResposta(pergunta, alternativa) {
    let respostas = JSON.parse(localStorage.getItem("respostas")) || [];

    respostas.push({
        pergunta: pergunta,
        alternativa: alternativa
    });

    localStorage.setItem("respostas", JSON.stringify(respostas));
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
        score[perfil] += 1;
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

    // Mostra no console (para testes)
    console.log("Resultado:", score);
    console.log("Top 3:", top3);

    // Aqui você já pode montar os elementos HTML da página final,
    // por exemplo:
    //
    // document.getElementById("perfil1_nome").innerText = nomesPerfis[top3[0].perfil];
    // document.getElementById("perfil1_texto").innerText = textosPerfis[top3[0].perfil];
    
}
