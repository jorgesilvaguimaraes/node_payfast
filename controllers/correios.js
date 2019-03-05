module.exports = function(app)
{
    app.post('/correios/calcula-prazo',function(req, res){
        let dadosDaEntrega = req.body;

        correiosSOAPClient = new app.servicos.CorreiosSOAPClient();

        correiosSOAPClient.calculaPrazo(dadosDaEntrega, function(erro, resultado){
            if(erro)
            {
                res.status(500).send(erro);
                return;
            }
            console.log('Prazo calculado');
            res.send(resultado);
        });
    });
}