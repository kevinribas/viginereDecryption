// A função indiceDeCoincidencia calcula o Índice de Coincidência (IC) de um texto para
// ajudar a determinar se o texto segue o padrão ingles ou portugues
function indiceDeCoincidencia(texto) {

    // Calculam o tamanho do texto.
    const tamanho = texto.length;
    // Objeto para armazenar a frequência de cada letra no texto.
    const frequencias = {};

    // Conta a frequência de cada letra no texto
    for (let letra of texto) {
        frequencias[letra] = (frequencias[letra] || 0) + 1;
    }

    // Calcula o índice de coincidência
    return Object.values(frequencias).reduce((soma, valor) => soma + valor * (valor - 1), 0) / (tamanho * (tamanho - 1));
}

module.exports = { indiceDeCoincidencia };
