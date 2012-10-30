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
            localStorage.setItem(model.gid, JSON.stringify(attributes));
            _addToIndex(model.gid);
        };


        var LocalStorage = {
            create: function(model, callback) {
                _store(model);
                callback(true);
            },
            destroy: function(model, callback) {
                localStorage.removeItem(model.gid);
                _removeFromIndex(model.gid);
                callback(true);
            },
            read: function(callback) {
                if (!callback) return false;

                var existingIds = ModelModule.each(function() { return this.gid; });
                var gids = _readIndex();
                var models = [];
                var attributes, model, gid;

                for (var i = 0, length = gids.length; i < length; i++) {
                    gid = gids[i];

                    if (_inArray(existingIds, gid) === -1) {
                        attributes = JSON.parse(localStorage[gid]);
                        model = new ModelModule(attributes);
                        model.gid = gid;
                        models.push(model);
                    }
                }

               callback(models);
            },
            update: function(model, callback) {
                _store(model);
                callback(true);
            }
        };

        return LocalStorage;
    };

    namespace[exportName] = LocalStore;

})(jii, 'LocalStore', 'Module');