const fs = require('fs');

fs.createReadStream('camisa_modelo_grafite_lamb.png')
    .pipe(fs.createWriteStream('imagem-com-stream.png'))
    .on('finish',function(){
        console.log('Arquivo escrito com stream');
    })