var path = require('path');
const root = path.normalize(__dirname);

console.log(root);

module.exports = {
    PORT : 3000,
    MONGO_IP : 'localhost',
    MONGO_PORT : 27017,
    MONGO_DB_NAME : 'kinginvest',
    MODELS_DIR: root + '/models',   
    LIBS_DIR: root + '/libs',
    secret: '5f03db319ca5a4d0de6830d3556d4ff9a1b95d5da077ecd3e866837538df7ee3'
}