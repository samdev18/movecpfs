import inquirer from 'inquirer';
import {moveFilesFromSpreadsheet} from './index.js';  
import {renameItemsInDirectory} from './renomearArquivos.js';  

const mainMenuQuestions = [
    {
        type: 'list',
        name: 'action',
        message: 'Selecione o que deseja fazer:',
        choices: ['Mover/copiar arquivos', 'Renomear arquivos e pastas'],
    },
];

const moveCopyQuestions = [
    {
        type: 'input',
        name: 'nomeDaPlanilha',
        message: 'Informe o caminho para a planilha:',
    },
    {
        type: 'input',
        name: 'nomeDaPastaComArquivos',
        message: 'Informe o caminho para a pasta de arquivos:',
    },
    {
        type: 'input',
        name: 'nomeDaNovaPasta',
        message: 'Informe o caminho para a pasta de destino:',
    },
    {
        type: 'list',
        name: 'acao',
        message: 'Selecione a ação (mover ou copiar):',
        choices: ['mover', 'copiar'],
    },
    {
        type: 'confirm',
        name: 'confirm',
        message: 'Confirma a execução com os parâmetros fornecidos?',
        default: true,
    },
];

const renameQuestions = [
    {
        type: 'input',
        name: 'directoryPath',
        message: 'Informe o caminho do diretório para renomear arquivos e pastas:',
    },
    {
        type: 'confirm',
        name: 'confirm',
        message: 'Confirma a execução com o parâmetro fornecido?',
        default: true,
    },
];

async function main() {
    const { action } = await inquirer.prompt(mainMenuQuestions);

    switch (action) {
        case 'Mover/copiar arquivos': {
            const answers = await inquirer.prompt(moveCopyQuestions);
            if (answers.confirm) {
                await moveFilesFromSpreadsheet(answers);
                console.log('Operação de mover/copiar concluída.');
            }
            break;
        }

        case 'Renomear arquivos e pastas': {
            const answers = await inquirer.prompt(renameQuestions);
            if (answers.confirm) {
                await renameItemsInDirectory(answers.directoryPath);
                console.log('Renomeação concluída.');
            }
            break;
        }
    }
}

main().catch(error => {
    console.error('Ocorreu um erro:', error);
});
