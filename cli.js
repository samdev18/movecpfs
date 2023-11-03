import inquirer from 'inquirer';
import { moveFilesFromSpreadsheet } from './index.js';
import { renameItemsInDirectory } from './renomearArquivos.js';
import { spreadSheetToDoc } from './SpreadSheetToDoc.js';
import { completeUserSheet } from './higienizar.js';

const mainMenuQuestions = [
    {
        type: 'list',
        name: 'action',
        message: 'Selecione o que deseja fazer:',
        choices: ['Mover/copiar arquivos',
            'Renomear arquivos e pastas',
            'Converter planilha para documentos Word',
            'Higienizar',
            'Sair'
        ],
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

const spreadSheetToDocQuestions = [
    {
        type: 'input',
        name: 'spreadsheetPath',
        message: 'Informe o caminho da planilha que você deseja converter:',
    },
    {
        type: 'input',
        name: 'wordTemplatePath',
        message: 'Informe o caminho para o modelo de documento Word:',
    },
    {
        type: 'input',
        name: 'outputDirectory',
        message: 'Informe o diretório onde os documentos Word serão salvos:',
    },
    {
        type: 'confirm',
        name: 'confirm',
        message: 'Confirma a execução com os parâmetros fornecidos?',
        default: true,
    },
];

const completeSheetQuestions = [
    {
        type: 'input',
        name: 'baseSpreadsheetPath',
        message: 'Informe o caminho da planilha base de dados:',
    },
    {
        type: 'input',
        name: 'userSpreadsheetPath',
        message: 'Informe o caminho da planilha do usuário que você deseja completar:',
    },
    {
        type: 'confirm',
        name: 'confirm',
        message: 'Confirma a execução com os parâmetros fornecidos?',
        default: true,
    },
];


async function main() {
    let shouldContinue = true;

    while (shouldContinue) {
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

            case 'Converter planilha para documentos Word': {
                const answers = await inquirer.prompt(spreadSheetToDocQuestions);
                if (answers.confirm) {
                    await spreadSheetToDoc(answers.spreadsheetPath, answers.wordTemplatePath, answers.outputDirectory);
                    console.log('Conversão de planilha para documentos Word concluída.');
                }
                break;
            }
            case 'Higienizar': {
                const answers = await inquirer.prompt(completeSheetQuestions);
                if (answers.confirm) {
                    await completeUserSheet(answers.userSpreadsheetPath, answers.baseSpreadsheetPath);
                    console.log('Planilha completada.');
                }
                break;
            }

            case 'Sair':
                shouldContinue = false;
                console.log('Saindo...');
                break;
        }
    }
}

main().catch(error => {
    console.error('Ocorreu um erro:', error);
});
