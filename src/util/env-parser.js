var parseIntNaN = function(value, nanDefault) {
    var parsed = parseInt(value, 10);
    if (isNaN(parsed)) { parsed = nanDefault; }
    return parsed;
};

module.exports = {
    // convert 'true' to true
    boolean: function(val) { return val === 'true'; },
    // convert '42' to 42
    int: function (def) { return function(val){ return parseIntNaN(val, def);};},
    // convert '_ag3WU77' to new Buffer('_ag3WU77')
    buffer: function (val) { return new Buffer(val);},
    // convert '_ag3WU77' to new Buffer('DjiZ7AWTeNh38zoQiZ76gw==', 'base64')
    buffer64: function (val) { return new Buffer(val, 'base64');},
    // convert 'key0:val0,key1:val1' to {key0:'val0',key1:'val1'}
    objectList: function(idField) { return function(val) {
        return val.split(';').reduce(function(all, objectString){
            if (objectString.length === 0) { return all; }
            var obj = objectString.split(',').reduce(function (obj, propPair) {
                var v = propPair.split(':');
                obj[v[0]] = v[1];
                return obj;
            }, {});
            all[obj[idField]] = obj;
            delete obj[idField];
            return all;
        }, {});
    };}
};
