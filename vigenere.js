// Função que descriptografa utilizando a cifra de Vigenère de forma inversa para decifrar o texto cifrado.
// Recebe o texto cifrado e a chave e reverte o processo de cifragem letra por letra.
function descriptografar(textoCifrado, chave) {
    let textoDescriptografado = '';
    const tamanhoChave = chave.length;
    let indiceChave = 0;

    // Percorre cada caractere do texto cifrado.
    for (let letra of textoCifrado) {
        const shift = chave.charCodeAt(indiceChave % tamanhoChave) - 'a'.charCodeAt(0);

        // Descriptografa a letra e a adiciona ao texto descriptografado
        const letraDescriptografada = String.fromCharCode(((letra.charCodeAt(0) - 'a'.charCodeAt(0) - shift + 26) % 26) + 'a'.charCodeAt(0));
        textoDescriptografado += letraDescriptografada;
        indiceChave++;
    }

    // Retorna o texto descriptografado
    return textoDescriptografado;
}

module.exports = { descriptografar };
