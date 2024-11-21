const fs = require('fs');
const readline = require('readline');
const { descobreTamanhoChave, descobreChave } = require('./analiseFrequencia');
const { descriptografar } = require('./vigenere');

// Cria interface para entrada de dados do usuário
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Solicita ao usuário o nome do arquivo de entrada
rl.question("Digite o nome do arquivo sem a extensão (Ex: cipher1): ", (nomeDoArquivo) => {
    const caminhoDoArquivoCifrado = `textos/${nomeDoArquivo}.txt`;

    // Leitura do texto cifrado e descriptografia
    fs.readFile(caminhoDoArquivoCifrado, 'utf8', (err, textoCifrado) => {
        if (err) {
            console.error("Erro ao carregar o texto cifrado:", err);
            rl.close();
            return;
        }
        console.log("Carregando...");

        const [idioma, tamanhoChave] = descobreTamanhoChave(textoCifrado);
        console.log("Tamanho da chave:", tamanhoChave);
        console.log("Língua do texto:", idioma);

        const chave = descobreChave(textoCifrado, tamanhoChave, idioma);
        console.log("Chave:", chave);

        const textoClaro = descriptografar(textoCifrado, chave);
        console.log("Texto decifrado com sucesso");

        // Define o nome do arquivo de saída
        const caminhoDoArquivoDecifrado = `claro/${nomeDoArquivo}_claro.txt`;

        fs.writeFile(caminhoDoArquivoDecifrado, textoClaro, err => {
            if (err) {
                console.error("Erro ao salvar o texto claro:", err);
                rl.close();
                return;
            }
            console.log(`Texto claro salvo em: ${caminhoDoArquivoDecifrado}`);
            rl.close();
        });
    });
});
