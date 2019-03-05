const fs = require('fs');

fs.readFile('camisa_modelo_grafite_lamb.png', function(erro, buffer){
    if(erro)
    {
        console.log(erro);
    }
    console.log('Arquivo lido');
    fs.writeFile('image2.png',buffer, function(){
        console.log('arquivo escrito');
    });
})