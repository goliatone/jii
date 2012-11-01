(function(namespace, exportName, moduleName){

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


    
    var LocalStore = function(ModelModule) {
        if (!window.localStorage) return noLocalStore;

        var collectionId = ModelModule.__name__+"-collection";

        var _inArray = function(array, obj) {
            if(array.indexOf) return array.indexOf(obj);

            for (var i = 0, length = array.length; i < length; i++) {
              if (array[i] === obj) return i;
            }

            return -1;
        };

        var _readIndex = function() {
            var data = localStorage[collectionId];
            return data ? JSON.parse(data) : [];
        };

        var _writeIndex = function(gids) {
            localStorage.setItem(collectionId, JSON.stringify(gids));
        };

        var _addToIndex = function(gid) {
            var gids = _readIndex();

            if (_inArray(gids, gid) === -1) {
                gids.push(gid);
                _writeIndex(gids);
            }
        };

        var _removeFromIndex = function(gid) {
            var gids  = _readIndex();
            var index = _inArray(gids, gid);

            if (index > -1) {
                gids.splice(index, 1);
                _writeIndex(gids);
            }
        };

        var _store = function(model) {
            var attributes = model.toJSON();
            //attributes.gid = model.gid;
            localStorage.setItem(model.gid, JSON.stringify(attributes));
            // model.log('store into freezer: ', model.gid);
            _addToIndex(model.gid);
        };

        var _isArray=function(value) {

            return Object.prototype.toString.call(value) === '[object Array]';
        };

        var LocalStorage = {
            makeStoreId:function(ModelModule){
                return ModelModule.__name__+"-collection";
            },
            create: function(model, callback) {
                if(_isArray(model)){
                    for(var i = 0, t = model.length;i<t;++i){
                        // console.log('add model: ', i,' : ', model[i].gid);
                        _store(model[i]);
                    }
                }
                else _store(model);
                
                if(callback) callback(true);
            },
            destroy:function(model, callback) {
                if(model){
                    localStorage.removeItem(model.gid);
                    _removeFromIndex(model.gid);
                } else {
                    var ids = _readIndex();
                    for(var i=0, t = ids.length; i<t; i++){
                        _removeFromIndex(ids[i]);
                    }
                }

                if(callback) callback(true);
            },
            read:function(callback) {
                //if (!callback) return false;

                var existingIds = ModelModule.each(function(item) { return item.gid; });
                var gids = _readIndex();
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
                        model = new ModelModule(attributes);
                        model.gid = gid;
                    } else {
                        model = ModelModule.findByGid(gid);
                    }

                    models.push(model);
                }

                if(callback) callback(models);

                return models;
            },
            update: function(model, callback) {
                _store(model);
                if(callback) callback(true);
            }
        };

        return LocalStorage;
    };

    namespace[exportName] = LocalStore;

})(jii, 'LocalStore', 'Module');