//TODO: Unify interface with localstorage
(function(namespace, exportName, moduleName){

    var Module = namespace[moduleName];

    var REST = Module(exportName);

    /**
     * Create action map object.
     *
     * @access private
     * @return {Function}
     */
    var _initializeActionMap = function(service){

        //TODO: Use attributes and dirty elements from
        //model, so that we don't send everything back
        //to the server.
        //TODO: Are we covering relationships?
        var actionMap = {};

        actionMap['create'] = {
            url:'/api/{modelId}/',
            type:'POST',
            data:'toJSON'
        };

        actionMap['read']   = {
            url:'/api/{modelId}/{id}',
            type:'GET',
            data:null
        };

        actionMap['update'] = {
            url:'/api/{modelId}/{id}',
            type:'PUT',
            data:'toJSON'
        };

        actionMap['destroy'] = {
            url:'/api/{modelId}/{id}',
            type:'DELETE',
            data:null
        };

        actionMap.compile = function(action, model){

            var settings = actionMap[action];
            var options  = $.extend({}, settings);


            //Build data payload.
            if(options.data) options.data = service.buildPayload(options.data,model);

            options.url  = service.buildUrl(options.url, model, service);
            return options;
        };

        service.actionMap = actionMap;

    };

    var _initializeActionSettings = function(service, action, model, options){

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
            error:service.proxy(service.onError, model, options),
            success:service.proxy(service.onSuccess, model, options)
        };

        return settings;
    };

    /**
     * Object containing configuration options
     * for each CRUD action.
     * @type {Object}
     */
    REST.prototype.actionMap = {};

    REST.prototype.init = function(){
        
        _initializeActionMap(this);
    };


    REST.prototype.buildPayload = function(method, model){
        //TODO: Check if model has method! Throw Error!
        return JSON.stringify(model[method]());
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

    REST.prototype.service = function(action, model, options){

        //TODO: How do we merge options.data and compiled data?
        //TODO: Add support for search. How do we serialize params?!
        //TODO: We should get data, then merge from options, and
        //delete options.data, so that we dont override this on final
        //merge.
        // var data = {};
        // if(options && options.data){
        //     data = $.merge(data, options.data);
        // }
        // data = options.data;
        // if(options && options.success) callback = options.success;
        var settings = _initializeActionSettings(this, action, model, options);
        console.log(settings);

        if(options && options.settings)
            settings = $.merge(settings, options.settings);

        console.log(settings);

        //TODO: Make this.transport(settings) => REST.proto.transport = $.ajax;?
        $.ajax(settings);
    };


    REST.prototype.onSuccess = function(model, options, data, textStatus, jqXHR){
        
        if(options && options.onSuccess){
            options.onSuccess(data, model, jqXHR, textStatus);
        }
    };


    REST.prototype.onError = function(model, options, jqXHR, textStatus, errorThrown){
        //TODO, how do we handle this? We should push to the
        //validation? etc...

        if(options && options.onError){
            options.onError(model, errorThrown, jqXHR, textStatus);
        }

    };

    REST.prototype.create = function(model, options, callback){
        return this.service('create', model, options, callback);
    };

    REST.prototype.read = function(model, options, callback){
        return this.service('read', model, options, callback);
    };

    REST.prototype.update = function(model, options, callback){
        return this.service('update', model, options, callback);
    };

    REST.prototype.destroy = function(model, options, callback){
        return this.service('destroy', model, options, callback);
    };

    REST.prototype.handle302 = function(){
        console.log('We got an 404');
    };

    namespace[exportName] = REST;

})(jii, 'REST', 'Module');