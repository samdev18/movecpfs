import { readFileSync, writeFileSync } from 'fs';
import ExcelJS from 'exceljs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import ProgressBar from 'progress';

const isDate = value => value instanceof Date;

const formatDate = date => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const spreadSheetToDoc = async (excelFile, templateDoc, outputDirectory) => {
  const loadWordTemplate = () => {
    const content = readFileSync(templateDoc, 'binary');
    const zip = new PizZip(content);
    return new Docxtemplater(zip);
  };

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(excelFile);
  const worksheet = workbook.getWorksheet(1);

  // Crie a barra de progresso
  const bar = new ProgressBar(':bar :percent :etas', { total: worksheet.actualRowCount - 1 });

  let columnNames = [];
  worksheet.eachRow((row, rowIndex) => {
    const data = {};

    row.eachCell((cell, colNumber) => {
      if (rowIndex === 1) {
        columnNames[colNumber] = cell.value;
      } else {
        const columnName = columnNames[colNumber];
        let cellValue = cell.value;
        if (isDate(cellValue)) {
          cellValue = formatDate(cellValue);
        }
        data[columnName] = cellValue;
      }
    });

    if (rowIndex !== 1) {
      const doc = loadWordTemplate();
      doc.setData(data);
      doc.render();

      const buffer = doc.getZip().generate({ type: 'nodebuffer' });
      writeFileSync(`${outputDirectory}/${data.CPF}.docx`, buffer);

      // Atualize a barra de progresso
      bar.tick();
    }
  });
};

export { spreadSheetToDoc };
