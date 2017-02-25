var mysql = require('mysql');

exports.connect = function() {
    return connection = mysql.createConnection({
        connectionLimit: 4,
        host: '',
        user: 'user',
        password: '',
        database: 'tomorrow_db'
    });
};
