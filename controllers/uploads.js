const fs = require('fs');

module.exports = function(app)
{
    app.post('/upload/imagem',function(req, res){
        console.log('recebendo imagem');
        let filename = req.headers.filename;
        req.pipe(fs.createWriteStream(`files/${filename}`))
        .on('finish',function(){
            console.log('Arquivo escrito');
            res.status(201).send('ok');
        })
    })
}