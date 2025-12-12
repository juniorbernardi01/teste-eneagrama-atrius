async function calcularResultado() {
    const matriz = await fetch("../data/matriz.json").then(r => r.json());
    let score = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};

    const respostas = JSON.parse(localStorage.getItem("respostas"));

    respostas.forEach(r => {
        const perfil = matriz[r.pergunta][r.alternativa];
        score[perfil] += 1;
    });

    localStorage.setItem("resultado", JSON.stringify(score));
    window.location.href = "resultado.html";
}
