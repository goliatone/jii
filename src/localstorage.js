(function(namespace, exportName, moduleName){

    var Module = namespace[moduleName];

    var noLocalStore = {
        create:function(model, callback) {
            callback(true);
        },
        destroy:function(model, callback) {
            callback(true);
        },
        read:function(callback) {
            callback([]);
        },
        update:function(model, callback) {
            callback(true);
        }
    };

    var _inArray = function(array, obj) {
        if(array.indexOf) return array.indexOf(obj);

        for (var i = 0, length = array.length; i < length; i++) {
          if (array[i] === obj) return i;
        }

        return -1;
    };

    var _readIndex = function(collectionId) {
        var data = localStorage[collectionId];
        return data ? JSON.parse(data) : [];
    };

    var _writeIndex = function(gids, collectionId) {
        localStorage.setItem(collectionId, JSON.stringify(gids));
    };

    var _addToIndex = function(gid, collectionId) {
        var gids = _readIndex(collectionId);

        if (_inArray(gids, gid) === -1) {
            gids.push(gid);
            _writeIndex(gids, collectionId);
        }
    };

    var _removeFromIndex = function(gid, collectionId) {
        var gids  = _readIndex(collectionId);
        var index = _inArray(gids, gid);

        if (index > -1) {
            gids.splice(index, 1);
            _writeIndex(gids, collectionId);
        }
    };

    var _store = function(model, collectionId) {
        var attributes = model.toJSON();
        //attributes.gid = model.gid;
        localStorage.setItem(model.gid, JSON.stringify(attributes));
        // model.log('store into freezer: ', model.gid);
        _addToIndex(model.gid, collectionId);
    };

    var _isArray=function(value) {

        return Object.prototype.toString.call(value) === '[object Array]';
    };

    var LocalStore = Module(exportName, 'BaseModule').include({
        init:function init(ModelModule){
            this.modelModule  = ModelModule;
            this.collectionId = ModelModule.__name__+"-collection";
        },
        makeStoreId:function makeStoreId(ModelModule){
            return ModelModule.__name__+"-collection";
        },
        create: function create(model, callback) {
            if(_isArray(model)){
                for(var i = 0, t = model.length;i<t;++i){
                    // console.log('add model: ', i,' : ', model[i].gid);
                    _store(model[i], this.collectionId);
                }
            }
            else _store(model, this.collectionId);
            
            if(callback) callback(true);
        },
        destroy:function(model, callback) {
            if(model){
                localStorage.removeItem(model.gid);
                _removeFromIndex(model.gid, this.collectionId);
            } else {
                var ids = _readIndex(this.collectionId);
                for(var i=0, t = ids.length; i<t; i++){
                    _removeFromIndex(ids[i], this.collectionId);
                }
            }

            if(callback) callback(true);
        },
        read:function(callback) {
            //if (!callback) return false;

            var existingIds = this.modelModule.each(function(item) { return item.gid; });
            var gids = _readIndex(this.collectionId);
            var models = [];
            var attributes, model, gid;
            // console.log('ids:  ', existingIds);
            // console.log('gids: ', gids);
            for (var i = 0, length = gids.length; i < length; i++) {
                gid = gids[i];

                //TODO: review else,
                // just pull from ModelModule.get(gid)
                if (_inArray(existingIds, gid) === -1) {
                    attributes = JSON.parse(localStorage[gid]);
                    model = new this.modelModule(attributes);
                    model.gid = gid;
                } else {
                    model = this.modelModule.findByGid(gid);
                }

                models.push(model);
            }

            if(callback) callback(models);

            return models;
        },
        update: function(model, callback) {
            _store(model, this.collectionId);
            if(callback) callback(true);
        }
    });
    
   
    var available = window.localStorage;
    namespace[exportName] = available ? LocalStore : noLocalStore;

})(jii, 'LocalStore', 'Module');