const cluster = require('cluster');
const os = require('os');

let cpus = os.cpus();

console.log(cpus);
console.log('Execultando tread');

if(cluster.isMaster)
{
    console.log('tread master');
    cpus.forEach(function(){
        cluster.fork();
    });

    cluster.on('listening',function(worker){
        console.log('cluster conectado - ' + worker.process.pid);
    });

    cluster.on('exit', worker => {
        console.log('cluster %d desconectado', worker.process.pid);
        cluster.fork();
    })
}else{
    console.log('tread sleve');
    require('./index.js');
}