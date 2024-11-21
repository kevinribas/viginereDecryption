const { indiceDeCoincidencia } = require('./ic');
const { descriptografar } = require('./vigenere');

const frequenciasIngles = {
    'a': 8.17, 'b': 1.49, 'c': 2.78, 'd': 4.25, 'e': 12.70,
    'f': 2.23, 'g': 2.02, 'h': 6.09, 'i': 6.97, 'j': 0.15,
    'k': 0.77, 'l': 4.03, 'm': 2.41, 'n': 6.75, 'o': 7.51,
    'p': 1.93, 'q': 0.10, 'r': 5.99, 's': 6.33, 't': 9.06,
    'u': 2.76, 'v': 0.98, 'w': 2.36, 'x': 0.15, 'y': 1.97,
    'z': 0.07
};

const frequenciasPortugues = {
    'a': 14.63, 'b': 1.04, 'c': 3.88, 'd': 4.99, 'e': 12.57,
    'f': 1.02, 'g': 1.30, 'h': 1.28, 'i': 6.18, 'j': 0.40,
    'k': 0.02, 'l': 2.78, 'm': 4.74, 'n': 4.63, 'o': 9.73,
    'p': 2.52, 'q': 1.20, 'r': 6.53, 's': 7.81, 't': 4.34,
    'u': 4.63, 'v': 1.67, 'w': 0.01, 'x': 0.21, 'y': 0.01,
    'z': 0.47
};

// Função que tenta descobrir o tamanho da chave usada no texto cifrado.
// A ideia é calcular o Índice de Coincidência (IC) para vários tamanhos de chave e ver qual deles
// se aproxima mais dos valores típicos para textos em inglês e português.
function descobreTamanhoChave(textoCifrado) {

    // Valores típicos de IC para inglês e português
    const indiceCoincidenciaIngles = 0.0667;
    const indiceCoincidenciaPortugues = 0.0727;

    // Variabilidade aceitável ao comparar ICs permitindo uma margem de erro
    const variacao = 0.01;

    // Listas para armazenar possíveis tamanhos de chave e os mais prováveis
    const tamanhosPossiveis = [];
    const chavesMaisProvaveis = [];

    // Chaves tamanho de 1 a 20
    const tamanhoMinimo = 1;
    const tamanhoMaximo = 20;


    // Para cada tamanho de chave entre 1 e 20,
    // divide o texto cifrado em partes correspondentes às letras da chave
    for (let tamanho = tamanhoMinimo; tamanho < tamanhoMaximo; tamanho++) {
        // Divide o texto em substrings
        const substrings = Array.from({ length: tamanho }, (_, i) =>
            textoCifrado.split('').filter((_, index) => index % tamanho === i).join('')
        );
        // Para cada conjunto de substrings, calcula o IC médio.
        const mediaICSubstrings = substrings.reduce((sum, substring) =>
            sum + indiceDeCoincidencia(substring), 0) / tamanho;
        // Guarda o tamanho da chave e o IC médio calculado para aquele tamanho.
        tamanhosPossiveis.push([tamanho, mediaICSubstrings]);
    }

    // Compara o resultado com os ICs de inglês e português.
    for (let item of tamanhosPossiveis) {
        if ((indiceCoincidenciaIngles - variacao) <= item[1] && item[1] <= (indiceCoincidenciaPortugues + variacao)) {
            // Calculam a diferença entre o IC do texto cifrado e os ICs típicos
            const diferencas = [Math.abs(item[1] - indiceCoincidenciaIngles), Math.abs(item[1] - indiceCoincidenciaPortugues)];

            // Guarda o tamanho da chave e as diferenças de IC para ver qual idioma tem a melhor correspondência
            chavesMaisProvaveis.push([item, diferencas]);
        }
    }

    // Se nenhuma chave possível foi encontrada, lança um erro informando que não conseguimos encontrar o tamanho da chave
    if (chavesMaisProvaveis.length === 0) {
        throw new Error('Não foi possível encontrar um tamanho de chave adequado.');
    }

    // Escolhe a chave com a menor diferença entre o IC do texto cifrado e os ICs típicos
    const chave = chavesMaisProvaveis.reduce((a, b) => (Math.min(...a[1]) < Math.min(...b[1]) ? a : b));

    // Calculam qual das duas diferenças foi a menor.
    const menorDiferenca = Math.min(...chave[1]);

    // Determina o idioma com base na menor diferença
    const idioma = (chave[1][0] === menorDiferenca) ? 'ingles' : 'portugues';

    // Retorna o idioma e o tamanho da chave
    return [idioma, chave[0][0]];
}

// Função que tenta descobrir qual é a chave usando análise de frequência para
// comparar as letras cifradas com as frequências típicas de letras em português e inglês
function descobreChave(textoCifrado, tamanhoChave, idioma) {
    const frequencias = idioma === 'ingles' ? frequenciasIngles : frequenciasPortugues;
    let chave = '';

    // Para cada posição na chave, tenta descobrir qual letra foi usada.
    for (let i = 0; i < tamanhoChave; i++) {
        const substring = textoCifrado.split('').filter((_, index) => index % tamanhoChave === i).join('');
        let maxMatch = 0;
        let letraChave = '';

        // Testa todas as letras do alfabeto para essa posição da chave
        for (let letraPossivel of 'abcdefghijklmnopqrstuvwxyz') {
            // Descriptografa a substring usando a letra que esta sendo testada
            const decifrado = descriptografar(substring, letraPossivel);
            const frequenciasDecifradas = {};

            // Conta quantas vezes cada letra aparece no texto decifrado
            for (let c of decifrado) {
                frequenciasDecifradas[c] = (frequenciasDecifradas[c] || 0) + 1;
            }

            // Compara as frequências do texto decifrado com as frequências típicas da língua
            const match = Object.keys(frequencias).reduce((sum, char) => sum + (frequenciasDecifradas[char] || 0) * frequencias[char], 0);

            // Se for o melhor até agora, guarda essa letra.
            if (match > maxMatch) {
                maxMatch = match;
                letraChave = letraPossivel;
            }
        }

        // Adiciona a letra encontrada à chave
        chave += letraChave;
    }

    // Verificação de repetição da chave
    for (let i = 1; i <= chave.length / 2; i++) {
        const possivelChave = chave.slice(0, i);
        const repeticoes = Math.floor(chave.length / i);
        if (possivelChave.repeat(repeticoes) === chave.slice(0, possivelChave.length * repeticoes)) {
            console.log(`Chave repetida detectada. Chave real: ${possivelChave}`);
            return possivelChave;
        }
    }

    return chave;
}


module.exports = { descobreTamanhoChave, descobreChave };
