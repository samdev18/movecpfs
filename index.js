const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const yargs = require('yargs');

function normalizeCPF(cpf) {
  // Remove pontos, traços e quaisquer caracteres não numéricos
  return cpf.replace(/[^0-9]/g, '');
}

function moveFilesFromSpreadsheet({
  nomeDaPlanilha,
  nomeDaPastaComArquivos,
  nomeDaNovaPasta
}) {
  const workbook = xlsx.readFile(nomeDaPlanilha);
  const sheet_name_list = workbook.SheetNames;
  const xlData = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

  if (!fs.existsSync(nomeDaNovaPasta)) {
    fs.mkdirSync(nomeDaNovaPasta);
  }

  console.info("movendo arquivos")

  xlData.forEach(row => {
    const normalizedFileNameFromSheet = normalizeCPF(row["Arquivos"]);

    // Encontra um arquivo que corresponda ao CPF normalizado
    const matchedFile = fs.readdirSync(nomeDaPastaComArquivos).find(file => {
      const normalizedFileName = normalizeCPF(path.basename(file, path.extname(file)));
      return normalizedFileName === normalizedFileNameFromSheet;
    });

    if (matchedFile) {
      const sourceFilePath = path.join(nomeDaPastaComArquivos, matchedFile);
      const destFilePath = path.join(nomeDaNovaPasta, matchedFile);

      fs.copyFileSync(sourceFilePath, destFilePath);
    } else {
      console.log(`Arquivo correspondente ao CPF ${row["Arquivos"]} não encontrado.`);
    }
  });
  console.log("Arquivos movidos com sucesso!");
}

const argv = yargs
  .option('nomeDaPlanilha', {
    description: 'Nome do arquivo da planilha',
    alias: 'p',
    type: 'string'
  })
  .option('nomeDaPastaComArquivos', {
    description: 'Nome da pasta com os arquivos',
    alias: 'o',
    type: 'string'
  })
  .option('nomeDaNovaPasta', {
    description: 'Nome da nova pasta',
    alias: 'n',
    type: 'string'
  })
  .demandOption(['nomeDaPlanilha', 'nomeDaPastaComArquivos', 'nomeDaNovaPasta'], 'Por favor, forneça todos os argumentos necessários para continuar')
  .help()
  .alias('help', 'h')
  .argv;

moveFilesFromSpreadsheet({
  nomeDaPlanilha: argv.nomeDaPlanilha,
  nomeDaPastaComArquivos: argv.nomeDaPastaComArquivos,
  nomeDaNovaPasta: argv.nomeDaNovaPasta
});
