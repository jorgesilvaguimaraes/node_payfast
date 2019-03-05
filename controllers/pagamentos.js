const logger = require('../servicos/Logger.js');

module.exports = function(app){
   
    // Lista todos pagamentos
    app.get('/pagamentos', function(req, res){
        res.send('pagamentos');
    });

    //Busca um pagamento
    app.get('/pagamentos/pagamento/:id', function(req, res){

        const id = req.params.id;
        console.log(`Consultando pagamento-${id}`);

        const memCachedClient = app.servicos.MemCachedClient();

        memCachedClient.get(`pagamento-${id}` , function(erro, retorno){
            if(erro || !retorno)
            {
                console.log('MISS - Chave não encontrada');
                const connection = app.persistencia.ConnectionFactory();
                const pagamentoDao = new app.persistencia.PagamentoDao(connection);

                pagamentoDao.buscaPorId(id, function(erro, resultado){
                    if(erro)
                    {
                        console.log('Erro ao consultar no banco');
                        res.status(404).send(erro);
                        return;
                    }
                    console.log('Pagamento encontrado' + JSON.stringify(resultado));
                    resultado.links = 
                    [
                        {
                            "rel":"confirmar",
                            "uri":`/pagamentos/pagamento/${resultado.id}`,
                            "method":"PUT"
                        }, 
                        {
                            "rel":"cancelar",
                            "uri":`/pagamentos/pagamento/${resultado.id}`,
                            "method":"DELETE"
                        }
                    ];     
                    res.send(resultado);       
                });

            }else{
                console.log('HIT - valor: '+ JSON.stringify(retorno));
                res.send(retorno);
                return;
            }
        });
    });
 
    // Cria um pagamento
    app.post('/pagamentos/pagamento',function(req, res){
        let pagamento = req.body['pagamento'];

        req.assert("pagamento.forma_de_pagamento", "Forma de pagamento é obrigatória").notEmpty();
        req.assert("pagamento.valor","Valor de pagamento é obrigatório").notEmpty().isFloat();
        req.assert("pagamento.moeda","Moeda é obrigatória e deve ter 3 caracteres").notEmpty().len(3,3);

        let errors = req.validationErrors();
        if(errors)
        {
            console.log("Erros de validação encontrados");
            res.status(400).send(errors);
            return;
        }

        console.log('processando uma requisição de um novo pagamento');

        pagamento.status = 'CRIADO';
        pagamento.data = new Date();

        const connection = app.persistencia.ConnectionFactory();
        const pagamentoDao = new app.persistencia.PagamentoDao(connection);

        pagamentoDao.salva(pagamento, (erro, resultado)=>{
            console.log('pagamento criado');
            if(erro) throw erro;

            let resposta = {
                dados_pagamento : pagamento
            }

            const memCachedClient = app.servicos.MemCachedClient();

            memCachedClient.set(`pagamento-${resultado.insertId}`, pagamento, 60000, function(erro){
                if(erro)
                {
                    console.log('Não foi possivel armazenar o pagamento no cached'+JSON.stringify(erro))
                }
                console.log('Chave adicionada ao cache: pagamento-'+resultado.insertId);
            })

            if(pagamento.forma_de_pagamento == "cartao")
            {
                var cartao = req.body['cartao'];
                const cartoesClient = new app.servicos.CartoesClient();
                
                cartoesClient.autoriza(cartao, function(exception, request, response, retorno){
                    
                   if(exception)
                   {
                       console.log(exception);
                       res.status(400).send(exception);
                       return;
                   }
                    console.log(retorno);
                    resposta.cartao = cartao;
                    
                    pagamento.links = 
                    [
                        {
                            "rel":"confirmar",
                            "uri":`/pagamentos/pagamento/${resultado.insertId}`,
                            "method":"PUT"
                        }, 
                        {
                            "rel":"cancelar",
                            "uri":`/pagamentos/pagamento/${resultado.insertId}`,
                            "method":"DELETE"
                        }
                    ];
                    res.location(`/pagamentos/pagamento/${resultado.insertId}`);
                    pagamento.id = resultado.insertId;
                    res.status(201).send(resposta);
                })


            }else{
                pagamento.links = 
                [
                    {
                        "rel":"confirmar",
                        "uri":`/pagamentos/pagamento/${resultado.insertId}`,
                        "method":"PUT"
                    }, 
                    {
                        "rel":"cancelar",
                        "uri":`/pagamentos/pagamento/${resultado.insertId}`,
                        "method":"DELETE"
                    }
                ];
                res.location(`/pagamentos/pagamento/${resultado.insertId}`);
                pagamento.id = resultado.insertId;
                res.status(201).send(resposta);
            }

            
        })
    });

    //Confirma um pagamento
    app.put('/pagamentos/pagamento/:id', function(req, res){
        let pagamento = {};
        const id = req.params.id;

        pagamento.id = id;
        pagamento.status = "CONFIRMADO";

        const connection = app.persistencia.ConnectionFactory();
        const pagamentoDao = new app.persistencia.PagamentoDao(connection);

        pagamentoDao.atualiza(pagamento, function(erro){
            if(erro){
                throw erro;
                res.status(500).send(erro);
                return;
            }

            console.log('pagamento criado');
            pagamento.links =
            [
                {
                    "rel":"self",
                    "uri":`/pagamentos/pagamento/${pagamento.id}`,
                    "method":"GET"
                }
            ];
            res.send(pagamento);

        });

    });
    
    //Cancela um pagamento
    app.delete('/pagamentos/pagamento/:id', function(req, res){

        let pagamento = {};
        const id = req.params.id;

        pagamento.id = id;
        pagamento.status = 'CANCELADO';

        const connection = app.persistencia.ConnectionFactory();
        const pagamentoDao = new app.persistencia.PagamentoDao(connection);

        pagamentoDao.delete(pagamento, function(erro){
            if(erro)
            {
                throw erro;
                res.status(500).send(erro);
                return 
            }
            console.log('Pagamento Cancelado');
            res.status(204).send(pagamento);
        });

    });
}