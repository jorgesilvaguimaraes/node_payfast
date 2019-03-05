const memcached = require('memcached');

function MemCachedClient()
{
    let cliente = new memcached('localhost:11211',{
        retries: 10,
        retry:10000,
        remove: true
    });

    return cliente;
}


module.exports = function()
{
    return MemCachedClient;
}




