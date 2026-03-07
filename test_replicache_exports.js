const replicache = require('replicache');
console.log('Replicache exports:', Object.keys(replicache));
if (replicache.Replicache) {
  console.log('Replicache class keys:', Object.keys(replicache.Replicache));
}
