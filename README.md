# movecpfs
para utilizar, sega estes passos: 
- instale o nodejs em seu computador
https://nodejs.org/en
- baixe esta pasta
- copie os arquivos desta pasta para a pasta anterior a sua pasta de arquivos de cpf
exemplo: se sua pasta de arquivos de cpf esta em documentos/arquivos, coloque os do programa dentro da pasta documentos
- abra o CMD na pasta. Tudo o que você precisa fazer é abrir a pasta no Windows Explorer, digitar CMD na barra de endereço do Explorer e pressionar Enter para abrir o Prompt
- Adicione a planilha dentro da mesma pasta (exemplo, documentos)
- rode o comando npm install
- rode o seguinte comando:
node index.js -p {nome da planilha}.xlsx -o {nome da pasta com os arquivos} -n {nome da pasta de destino} -a {acao}

# exemplo:
## Para mover
 node index.js -p "D:\planilha.xlsx" -o "D:\300k" -n "D:\destino" -a mover
 
## Para copiar
 node index.js -p "D:\planilha.xlsx" -o "D:\300k" -n "D:\destino" -a copiar

