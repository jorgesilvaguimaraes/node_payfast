const express = require('express');
const consign = require('consign');
const bodyParse = require('body-parser');
const expressValidator = require('express-validator');
const morgan = require('morgan');
const logger = require('../servicos/Logger.js');

module.exports = function(){
    const app = express();

    //Logger com morgan
    app.use(morgan("common", {
        stream: {
            write:function(message){
                logger.info(message);
            }
        }
    }));

    app.use(bodyParse.urlencoded({extended:true}));
    app.use(bodyParse.json());

    // modulo de validação express 
    app.use(expressValidator());

    consign()
        .include('controllers')
        .then('persistencia')
        .then('servicos')
        .into(app);
      
    return app;
}