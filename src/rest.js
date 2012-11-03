//TODO: Unify interface with localstorage.
(function(namespace, exportName, moduleName){
    var Module = namespace[moduleName];

    var REST = Module(exportName);

    var NAME_MATCHER = /:([\w\d]+)/g;
    var _getResourceParams = function(resource){
        var resourceParamNames = [];
        var param;
        while((param = NAME_MATCHER.exec(resource)) !== null){
            resourceParamNames.push(param[1]);
        }

        return resourceParamNames;
    };

    /**
     * Create action map object.
     *
     * @access private
     * @return {Function}
     */
    var _initializeActionMap = function(service){
        
        var actionMap = {};

        actionMap['create'] = {
            url:'/api/{modelId}/',
            type:'POST'
        };

        actionMap['read']   = {
            url:'/api/{modelId}/',
            type:'GET'
        };

        actionMap['update'] = {
            url:'/api/{modelId}/{id}',
            type:'PUT'
        };

        actionMap['destroy'] = {
            url:'/api/{modelId}/{id}',
            type:'DELETE'
        };

        actionMap.compile = function(action, model){
            var data     = $.ajaxSettings.data;
            var settings = actionMap[action];
            var options  = $.extend({}, settings);
            options.data = $.extend(options.data, data);
            options.url  = service.buildUrl(options.url, model, service);
            return options;
        };

        service.actionMap = actionMap;

    };

    var _initializeActionSettings = function(service, action, model, callback){
        
        var actionOptions = service.actionMap.compile(action, model);

        var settings = {
            url:actionOptions.url,
            type:actionOptions.type,
            dataType:"json",
            contentType:"application/json",
            data:actionOptions.data,
            //statusCode:{"302":this.proxy(this.handle302)},
            dataFilter:function(data, type){
                return (/\S/).test(data) ? data : undefined;
            },
            error:service.proxy(service.onError, model, callback),
            success:service.proxy(service.onSuccess, model, callback)
        };

        return settings;
    };

    /**
     * Object containing configuration options
     * for each CRUD action.
     * @type {Object}
     */
    REST.prototype.actionMap = {};

    /**
     * Array that contains the
     * @type {Array}
     */
    REST.prototype.resourceParamNames = [];

    REST.prototype.init = function(ModelModule, resource, methods){
        this.resource = resource;
        this.modelModule = ModelModule;
        this.resourceParamNames = _getResourceParams(resource);
        _initializeActionMap(this);
    };


    REST.prototype.buildUrl = function(template, data, scope){
        return this.parseUrl(template, data, scope);
    };

    REST.prototype.parseUrl = function(template,data, scope){
        function replaceFn(match, word,method, methodName, index, source ) {
            var out = (word in data) ? data[word] : '';
            if(method){
                if(typeof out[methodName] === 'function' ) out = out[methodName]();
                else if(typeof scope[methodName] === 'function') out = scope[methodName](out);
            }
            return out;
        }

        return template.replace(/\{(\w+)\}(\.(\w+))?/g, replaceFn);
    };
    
    REST.prototype.path = function(model){
        var path = this.resource;
        var param, i = 0, t = this.resourceParamNames.length;
        for(; i < t; i++){
            param = this.resourceParamNames[i];
            path = path.replace(":"+param, model.get(param));
        }

        return path;
    };

    

    REST.prototype.service = function(options, action, model, callback){
        //TODO: Add support for search. How do we serialize params?!
        //TODO: We should get data, then merge from options, and
        //delete options.data, so that we dont override this on final
        //merge.
        var data = {};
        if(options && options.data){
            data = $.merge(data, options.data);
        }
        data = options.data;

        var settings = _initializeActionSettings(this, action, model, callback);
        console.log(settings);

        //TODO: Merge options & settigns.
        settings = $.merge(settings, options);
        console.log(settings);
        console.log(settings.url+'?' + $.param(data));
        
        //TODO: Make this.transport(settings) => REST.proto.transport = $.ajax;?
        $.ajax(settings);
    };
    
    
    REST.prototype.onSuccess = function(model, callback, data, textStatus, jqXHR){
        console.log('on success');
    };

    
    REST.prototype.onError = function(model, callback, jqXHR, textStatus, errorThrown){
        console.log('on error for model ', model.id);
        console.log(arguments);
        if(callback) callback.call(this, arguments);
    };

    REST.prototype.create = function(model, options, callback){
        return this.service(options, 'create', model, callback);
    };

    REST.prototype.read = function(model, options, callback){
        return this.service(options, 'read', model, callback);
    };

    REST.prototype.update = function(model, options, callback){
        return this.service(options, 'update', model, callback);
    };

    REST.prototype.destroy = function(model, options, callback){
        return this.service(options, 'destroy', model, callback);
    };

    REST.prototype.handle302 = function(){
        console.log('We got an 404');
    };

    namespace[exportName] = REST;

})(jii, 'REST', 'Module');