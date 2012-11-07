/*! Jii - v0.1.0 - 2012-11-07
* http://goliatone.github.com/jii/
* Copyright (c) 2012 goliatone;
 Licensed MIT, GPL */
var VERSION = "0.1.0";
var jii = (function(namespace){


var jii = function(){
  this.version = '0.1.0';
};

jii.utils = {
    createObject:function(o) {
        var Func;
        Func = function() {};
        Func.prototype = o;
        return new Func();
    },
    // hasOwn:function(scope,prop){

    //    return Object.prototype.hasOwnProperty.call(scope,prop);
    // },
    isEmpty:function(obj){
        if(!obj) return true;
        if(typeof obj === "string"){
            if(obj === '') return true;
            else return false;
        }

        if(obj.hasOwnProperty('length') && obj.length === 0) return true;
        var key;
        for(key in obj) {
            if (obj.hasOwnProperty(key)) return false;
        }
        return true;
    },
    fixArguments:function(args){
        var a = Array.prototype.splice.call(args,0);

        if(!a[1] &&
           this.isArray(a[0]) &&
           a.length === 1) return a[0];

        return a;
    },
    hasAttributes:function(scope){
        var attrs = Array.prototype.splice.call(arguments,1);
        attrs = this.fixArguments(attrs);
        for(var prop in attrs){
            if(! (attrs[prop] in scope)) return false;
        }
        return true;
    },
    isFunc:function(obj, method){
        if(method) return ( (method in obj) &&
                             typeof obj[method] === 'function' );

        return (typeof obj === 'function');
    },
    isArray:function(value) {

        return Object.prototype.toString.call(value) === '[object Array]';
    },
    getKeys:function(o){
        if (typeof o !== 'object') return null;
        var ret=[],p;
        for(p in o){
            if(Object.prototype.hasOwnProperty.call(o,p)) ret.push(p);
        }
        return ret;
    },
    getKeysAll:function(o){
        if (typeof o !== 'object') return null;
        var ret={},p,i=0;
        for(p in o){
            if(Object.prototype.hasOwnProperty.call(o,p) &&
               o[p] !== null &&
                typeof o[p] === 'object' && !this.isArray(o[p])) ret[p] = this.getKeysAll(o[p]);
            else if(Object.prototype.hasOwnProperty.call(o,p)) ret[i++] = p;
        }
        return ret;
    },
    result:function(obj, property){
        if(obj == null) return null;
        var value = obj[property];
        return this.isFunc(value) ? value.call(obj) : value;
    },
    capitalize:function(str){

        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    map:function(source, callback, scope){
        var len = source.length;
        
        if (typeof callback !== "function")
            throw new TypeError(typeof callback);

        var out = new Array(len);
        for (var i = 0; i < len; i++)
        {
          if (i in source)
            out[i] = callback.call(scope || this, source[i], i, source);
        }

        return out;
    },
    merge:function(a, b){
        for(var p in b){
            if(b.hasOwnProperty(p))
                a[p] = b[p];
        }
        return a;
    },
    intersect:function(a,b){
        return a.filter(function(n){ return (b.indexOf(n) !== -1);});
        // return this.map(a, function(item){ return b.indexOf(item) !== -1; });
    },
    firstToLowerCase:function(str){

        return str.charAt(0).toLowerCase() + str.slice(1);
    },
    ensureNamespace:function(namespace, scope)
    {
        var target;
        scope = scope || jii;
        namespace = namespace.split('.');
        while((target = namespace.shift()))
        {
            if(typeof scope[target] === 'undefined')
                scope[target] = {};
            
            scope = scope[target];
        }

        return scope;
    },
    resolvePropertyChain:function(target, chain){
        if (!chain && typeof target === 'string') {
            chain  = target;
            target = window;//We could use global if node.
        }

        if(typeof chain === 'string') chain = chain.split('.');
        var l = chain.length, i = 0, p = '';
        for (; i < l; i++ ) {
            p = chain[i];
            if ( target.hasOwnProperty( p ) ) target = target[ p ];
            else return null;
        }
        return target;
    },
    argumentNames:function (fn) {
        var names = fn.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
          .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
          .replace(/\s+/g, '').split(',');
        return names.length === 1 && !names[0] ? [] : names;
    },
    truncate:function(str,len, suffix)
    {
        if(typeof str === 'undefined') return '';
        if(!str) return '';
        
        if(isNaN(len)) len = 50;
        if(typeof suffix === 'undefined') suffix = '...';
        
        len -= suffix.length;
        var trunc = str;
        
        if(trunc.length > len)
        {
            trunc = trunc.substr(0,len);
            //if(/[^\s]/.test(str.charAt(len))) trunc = trimRight(trunc.replace(/\w+$|\s+$/,''));
            if(/[^\s]/.test(str.charAt(len))) trunc = (trunc.replace(/\w+$|\s+$/,''));
            trunc += suffix;
        }
        
        return trunc;
    }
};
(function(jQuery, namespace, exportName){

    var _splice = Array.prototype.splice;

    var Module = function(name, parent){

        // if(namespace[name])
            // return name;

        //Lets figure out parent.
        //TODO: Add support for com.domain.Module.
        //parent = parent.split('.');
        //while(target = parent.pop()) parent = namespace[target];
        parent = parent || Module;

        if(typeof parent === 'string'){
            parent = namespace[parent];
        }

        var self = function(){
            if("init" in this) this.init.apply(this, arguments);
        };

        //define default constructor. TODO:we could rename it.
        self.prototype.init = function(){};

        //Change self proto.
        if(parent){
            for( var i in parent){
                if(parent.hasOwnProperty(i)){
                    self[i] = Module.clone(parent[i]);
                }
            }

            for( i in parent.prototype){
                if(parent.prototype.hasOwnProperty(i)){
                    self.prototype[i] = Module.clone(parent.prototype[i]);
                }
            }

            var Ctor = function(){
                this.ctor = this.constructor = self;
            };
            Ctor.prototype = parent.prototype;
            self.prototype = new Ctor();

            //We need to create super after proto.
            //self._super = parent;
            self.prototype._super = parent.prototype;
        }


    //------------------------------
    // Adding class/static properties: i.e: User.findByPk().
        self.extend = function(obj, target){
            target = target || self;
            var extended = obj.extended;
            for(var i in obj){
                if(obj.hasOwnProperty(i))
                    target[i] = obj[i];
            }

            if(extended) extended.call(target,target);

            return target;
        };
    //  -----------------------------------
    //  Adding instance properties- user.id = 23;
        /**
         * All properties of the provided object will be
         * copied into the prototype of all Module instances.
         *
         * @access  public
         * @param   Object  Template with properties to include.
         * @return  Object  Instance, fluid interface.
         */
        self.include = function(obj){
            var included = obj.included;
            for(var i in obj){
                if(obj.hasOwnProperty(i))
                    self.fn[i] = obj[i];
            }
            if(included) included.call(self.fn, self.fn);

            return self;
        };

        /**
         * Utility mehtod to proxy function calls
         * with the proper scope.
         * Any extra parameters passed to it, will be
         * concatenated into the final call.
         *
         * @access public
         * @param   Function    Function to be proxied.
         * @return  Function    Wrapped function with scope set to self.
         */
        self.proxy = function(func){
            var a = _splice.call(arguments,1);
            var self = this;
            return function(){
                var a2 = _splice.call(arguments,0);
                return func.apply(self, a.concat(a2));
            };
        };


        //shortcuts.
        self.fn = self.prototype;
        self.fn.parent = parent;
        self.fn.proxy  = self.proxy;


        // The class/parent name
        self.prototype.__name__  = self.__name__  = name;
        self.prototype.__class__ = self;

        //Store a reference by name in the provided namespace.
        namespace[name] = self;

        return self;
    };

    Module.__name__    = 'Module';
    //REVIEW: Should we have a per module or use jii.VERSION?
    Module.__version__ = "0.0.1";

    Module.decorator = function(implementation){
        var Decorator = function(){};
        Decorator.prototype.decorate = function(){
            var i = 0,
            t = arguments.length;
            for(;i < t; i++){
               implementation( arguments[i], this );
            }
        };

        return new Decorator();
    };

    Module.override = function(obj, method, fn){
        obj.parent = obj.parent || {};
        obj.parent[method] = obj[method];
        obj[method] = fn;
    };

    /**
     * Utility method to clone an object.
     *
     * @access  public.
     * @param   object  Object to be cloned.
     * @return  object  Cloned object.
     */
    Module.clone = function(obj){
        if (typeof obj === "function") return obj;
        if (typeof obj !== "object") return obj;
        if (jQuery.isArray(obj)) return jQuery.extend([], obj);
        return jQuery.extend({}, obj);
    };


    /*Module.merge = function(){
        console.log(_splice.call(arguments,0))
        return jQuery.extend.apply(jQuery, _splice.call(arguments,0));
    };*/

    /**
     * Scope in which the module will store all clases,
     * to prevent pollution of the global namespace.
     *
     * @access public
     * @param   object  scoped namespace for the module.
     * @return  object  scoped namespace for the module.
     */
    Module.namespace = function(ns){
        namespace = ns || namespace;
        if(!namespace.hasOwnProperty(exportName))
            namespace[exportName] = Module;
        return namespace;
    };
//  ------------------------------------------------------------
//  Make our Module available to the provided namespace.
    namespace  = namespace || this;
    exportName = exportName || 'Module';
    namespace[exportName] = Module;

    // return Module;

}(jQuery, jii, 'Module'));
(function(namespace,exportName, moduleName){
    var Module = namespace[moduleName];

    function _publish(list, args, options){
        var event, i, l;
        //Invoke callbacks. We need length on each iter
        //cose it could change, unsubscribe.
        // args = _slice.call(arguments, 1);
        //var o;
        for(i = 0, l = list.length; i < l; i++){
            event = list[i];
            if(!event) continue;
            
            //We want to have a dif. options object
            //for each callback;
            
            options.event  = event;
            options.target = event.target;//shortcut to access target.
            // o = $.extend({},options);

            if(!event.callback.apply(event.scope, args)) break;
            // if(!event.callback.apply(event.scope, a)) break;
        }
    }

    var _slice = [].slice;

    /*var _merge = function(a, b){
        for(var p in b){console.log(p); a[p] = b[p];}
        return a;
    };*/

    /**
     * PubSub mixin.
     * TODO: Handle scope!!! <= DONE
     * TODO: Handle options! <= WE NEED TO CLONE THEM!
     *
     * Use:
     * Module.include(PubSub);
     * If we need more complex stuff:
     * https://github.com/cmndo/PubSub/blob/master/pubsub.js
     * http://amplifyjs.com/api/pubsub/
     * https://github.com/appendto/amplify/blob/master/core/amplify.core.js
     * https://github.com/mroderick/PubSubJS
     * https://github.com/uxder/Radio/blob/master/radio.js
     */
    var mixPubSub = {
        subscribe: function(topic, callback, scope, options){
            //Create _callbacks, unless we have it
            var calls = this._callbacks || (this._callbacks = {});
            var topics = (calls[topic])  || (calls[topic] = []);
            //Create an array for the given topic key, unless we have it,
            //then append the callback to the array
            // topic.push(callback);
            var event = {};
            event.topic = topic;
            event.callback = callback;
            event.scope = scope || this;
            event.target = this;
            // event.options = options || {};//_merge((options || {}),{target:this});

            topics.push(event);
            return this;
        },
        subscribers:function(topic){

            return this._callbacks.hasOwnProperty(topic) && this._callbacks[topic].length > 0;
        },
        //TODO: Add 'all' support.
        publish:function(topic, options){
            //Turn args obj into real array
            var args = _slice.call(arguments, 1);

            //get the first arg, topic name
            options = options || {};

            //include the options into the arguments, making sure that we
            //send it along if we just created it here.
            args.push(options);

            var list, calls, all;
            //return if no callback
            if(!(calls = this._callbacks)) return this;
            //get listeners, if none and no global handlers, return.
            if(!(list = calls[topic]) && !calls['all']) return this;
            //if global handlers, append to list.
            //if((all = calls['all'])) list = (list || []).concat(all);

            if((all = calls['all'])) _publish.call(this, all, _slice.call(arguments, 0), options);
            // if((all = calls['all'])) _publish.call(this, all, [topic].concat(args));
            if(list) _publish.call(this,list, args, options);

            return this;
        },
        unsubscribe:function(topic, callback/*, scope*/){

            var list, calls, i, l;

            if(!(calls = this._callbacks)) return this;
            if(!(list  = calls[topic])) return this;

            for(i = 0, l = list.length; i < l; i++){
                if(list[i].callback === callback) list.splice(i,1);
            }

            return this;
        }
    };

    var mixins = {mixins:{pubsub:mixPubSub}};
    var PubSub = Module(exportName).include(mixPubSub).extend(mixins);
//  ------------------------------------------------------------
//  Make our Module available to the provided namespace.
    namespace  = namespace || this;
    exportName = exportName || 'PubSub';
    namespace[exportName] = PubSub;

})(jii,'PubSub', 'Module');
(function(namespace, exportName, moduleName){
	var Module = namespace[moduleName];

	var pubsub = namespace.PubSub.mixins['pubsub'];
	var BaseModule = Module(exportName).include(pubsub);


})(jii, 'BaseModule','Module');
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
(function(namespace, exportName, moduleName, extendsModule){

    var Module = namespace[moduleName];

/////////////////////////////////////////////////////////
//// HELPER METHODS.
/////////////////////////////////////////////////////////
    //Shim for Object.create
    var _createObject = Object.create || function(o) {
        var Func;
        Func = function() {};
        Func.prototype = o;
        return new Func();
    };

    var _hasOwn = function(scope,prop){

       return Object.prototype.hasOwnProperty.call(scope,prop);
    };

    var _isEmpty = function(obj){
        if(!obj) return true;
        if(typeof obj === "string"){
            if(obj === '') return true;
            else return false;
        }

        if( obj.hasOwnProperty('length') && obj.length === 0) return true;
        var key;
        for(key in obj) {
            if (obj.hasOwnProperty(key)) return false;
        }
        return true;

    };

    var _hasAttributes = function(scope){
        var attrs = Array.prototype.slice(arguments,1);
        for(var prop in scope){
            if(! _hasOwn(scope, prop)) return false;
        }
        return true;
    };

    var _isFunc = function(obj){

        return (typeof obj === 'function');
    };

    var _isArray = function(value) {

        return Object.prototype.toString.call(value) === '[object Array]';
    };

    var _getKeys = function(o){
        if (typeof o !== 'object') return null;
        var ret=[],p;
        for(p in o) if(Object.prototype.hasOwnProperty.call(o,p)) ret.push(p);
        return ret;
    };
    var _result = function(obj, property){
        if(obj == null) return null;
        var value = obj[property];
        return _isFunc(value) ? value.call(obj) : value;
    };

    var _capitalize =function(str){

        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    var _map = function(fun /*, thisp*/){
        var len = this.length;
        if (typeof fun !== "function")
          throw new TypeError();

        var res = new Array(len);
        var thisp = arguments[1];
        for (var i = 0; i < len; i++)
        {
          if (i in this)
            res[i] = fun.call(thisp, this[i], i, this);
        }

        return res;
    };

    var _merge = function(a, b){
        for(var p in b){
            if(b.hasOwnProperty(p))
                a[p] = b[p];
        }
        return a;
    };

    var _intersect = function(a,b){

        a.filter(function(n){ return (b.indexOf(n) !== -1);});
    };

    var _firstToLowerCase = function(str){

        return str.charAt(0).toLowerCase() + str.slice(1);
    };


/////////////////////////////////////////////////////
//// MODEL
/////////////////////////////////////////////////////
    /**
     * Model is a glorified Object with pubsub and an interface
     * to deal with attributes, validation
     *
     * TODO: Deal with attributes and relations. What if an
     *       attribute is an objecty? right now, we loose it.
     * TODO: Hold fields in its own object, instead of assigning
     *       them to the model instance. So they can be accessed
     *       with modelInstance.fields()
     */
    var Model = Module( exportName ).extend({
        records:{},
        grecords:{},
        attributes:[],
        extended:function(Self){
            Self.dispacher = new Self();
            Self.reset();
        },
        configure: function(config){

            //here, we should parse config to get
            //meta, and THEN, do a merge
            if(_hasOwn(config, 'attributes'))
                this.extend(config.attributes, this.attributes);
                //$.extend(true,this.attributes,config.attributes);


            // this.attributes = config.attributes;
            // this.unbind();
            //TODO: list configurable props and merge
            //only those from config.(?)
            this.fk = 'id';

        },
        clonesArray:function(array){
            var value;
            var i = 0, l = array.length;
            var result = [];
            for(; i < l; i++){
                value = array[i];
                result.push(value.clone());
            }

            return result;
        },
        makeGid:function(){
            return 'xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            }).toUpperCase();
        },
        isGid:function(gid){
            if(_isEmpty(gid)) return false;
            // if(typeof gid === obj)

            gid = gid.replace(/[A-Z\d]/g,function(){return 0;});
            return (gid === '00000000-0000-0000-0000-000000000000');
        },
        reset:function(options){
            this.records    = {};
            this.grecords   = {};
            this.attributes = [];
        },
        /**
         * Add a model or a list of models to the collection.
         *
         * @access   public
         * @param    record
         * @param    options
         * @return
         */
        //TODO: HOW DO WE WANT TO HANDLE CLONES AND STORING BY REF?!
        add:function(record,options){
            options = options || {silent:true};

            var records = _isArray(record) ? record.slice() : [record];

            var i = 0, l = records.length, local;
            for(;i < l; i++){
                records[i] = this._prepareModel(records[i],options);
            }

            i = 0;
            l = records.length;
            for(;i < l; i++){
                record = records[i];
                local = this.has(record) && this.get(record);

                if(local){
                    //Do we merge both records?!
                    if(options.merge && local) local.load(record);

                    //we already have it, remove it
                    records.splice(i,1);

                    //update index, ensure we loop all!
                    --i;
                    --l;

                    //and move on
                    continue;
                }

                //subscribe to updates
                record.subscribe('all', this._handleModel, this, options);

                //Nofity we are adding the record.
                // this.dispacher.publish('added', record);

                //save a ref. to the record.
                this.grecords[record.gid] = record;

                //save a ref to the record. TODO:Should we clone!?
                //TODO: use this.fk
                if(record.has('id')) this.records[record.id] = record;//.clone();

                //TODO: make id a method id() => return this[this.fk];
            }

            //should we register for all updates on model?!
            //that way we can track changes, i.e add it to the dirty
            //list, if id changes, update
            return record;
        },
        _prepareModel: function(attrs, options) {
            if (attrs instanceof Model) {
                //if (!attrs.collection) attrs.collection = this;
                return attrs;
            }
            options = options || {};
            //options.fk = this.fk;
            //options.collection = this;
            var model = new this.prototype.__class__(attrs, options);
            //if (!model._validate(model.attributes, options)) return false;
            return model;
        },
        get:function(id){
            id = this.ensureId(id);

            if(!this.has(id)) return null;

            var r;
            if((r = this.records[id])) return r;

            //at this point we know that it has to be a ghost one
            return this.grecords[id];
        },
        ensureId:function(id, onlyId){
            if(typeof id === 'object'){
                if(_hasOwn(id,'id')) id = id.id;
                else if(_hasOwn(id,'gid') && !onlyId) id = id.gid;
                else return null;
            }
            return id;
        },
        has:function(id){

            if(!id) return false;

            id = this.ensureId(id);

            //how do we want to handle errors!?
            return _hasOwn(this.records,id) || _hasOwn(this.grecords,id);
        },
        count:function(gRecords){
            var t = 0, p,rec;
            rec = gRecords ? this.grecords : this.records;

            for(p in rec){
                if(rec.hasOwnProperty(p))
                    t++;
            }

            return t;
        },
        remove:function(id){
            //TODO: Do we want to remove by gid?! most likely
            if(!this.has(id)) return null;

            var r = this.get(id);

            //remove all listeners
            r.unsubscribe('all',this.proxy(this._handleModel));

            //Nofity we are removing the record.
            // this.dispacher.publish('removed', r);


            //do remove
            delete this.records[r.id];
            delete this.grecords[r.gid];

            return r;
        },
        _handleModel:function(topic,options){
            switch(topic){
                case 'create':
                    //this.add(this);
                break;
                case 'remove':
                break;
                case 'destroy':
                    this.remove(options.target.id);
                break;

            }
        },

    ////////////////////////////////////////////////////////////
    //// ArrayCollection Stuff.
    ////////////////////////////////////////////////////////////
        each:function(callback, context){
            var r = this.all();
            var results = [];
            var key, value, i = 0;
            for(key in r){
                if(r.hasOwnProperty(key)){
                    value = r[key];
                    context = context || value;
                    results.push(callback.call(context, value, i++, r));
                }
            }
            return results;
        },
        all:function(){

            return this.clonesArray(this.recordsValues());
        },
        first:function(){
            var record = this.recordsValues()[0];
            //void 0, evaluates to undefined;
            return record ? record.clone() : 0;
        },
        last:function(){
            var values = this.recordsValues();
            var record = values[values.length - 1];
            return record ? record.clone() : void 0;
        },
        /*count:function(){
            return this.recordsValues().length;
        },*/
    ////////////

        toJSON:function(){

            return this.recordsValues();
        },
        fromJSON:function(objects){
            if(!objects) return null;

            console.log('FROM FUCKING JSON');

            if(typeof objects === 'string'){
                console.log(objects);
                try{
                    objects = JSON.parse(objects);
                } catch(e) {
                    console.log('Error! ',objects);
                }
            }

            if(_isArray(objects)){
                var result = [];
                var i = 0, l = objects.length;
                var value;
                for(; i < l; i++){
                    value = objects[i];
                    result.push(new this(value, {skipSync:true}));
                }
                return result;
            } else {
                return [new this(objects, {skipSync:true})];
            }
        },
        fromForm:function(selector){
            var model = new this();
            return model.fromForm(selector);
        },
        recordsValues:function(){
            var key, value;
            var result = [];
            var r = this.records;
            for(key in r){
                if(r.hasOwnProperty(key)){
                    value = r[key];
                    result.push(value);
                }
            }
            return result;
        }
    }).include({
        //TODO: Do we want this on the reset method, what about inheritance.
        errors:{},
        validators:{},
        scenario:null,
        init:function(attrs, options){
            this.modelName = _capitalize(this.__name__);
            this.modelId   = _firstToLowerCase(this.__name__);

            this.clearErrors();

            if(attrs) this.load(attrs,options);

            console.log('CREATE MODEL, ',this.gid);

            this.gid = this.ctor.makeGid();
            // if(attrs && attrs.hasOwnProperty('gid'))
            //     this.gid = attrs.gid;

            //We save a copy in static model.
            this.ctor.add(this);

        },
        log:function(){
            if(this.debug === false || !window.console) return;
            window.console.log.apply(window.console, arguments);
        },
    ////////////////////////////////////////////////////////
    //// VALIDATION: Todo, move to it's own module.
    ////////////////////////////////////////////////////////
        validate:function(attributes, options){
            options = options || {};
            if(options.clearErrors) this.clearErrors();
            var validators, validator, prop;
            validators = this.getValidators();

            //if(this.beforeValidate()) return false;

            for(prop in validators){
                if(validators.hasOwnProperty(prop)){
                    validator = validators[prop];
                    //TODO: do we want to register objects or methods?
                    //validator.call(this, attributes);
                    validator.validate(this, attributes);
                }
            }

            //this.afterValidate();

            return !this.hasErrors();
        },
        getValidators:function(attribute){
            //ensure we have validators.
            this.getValidatorList();
            var validators = [];
            var validator;
            var scenario = this.getScenario();
            for(validator in validators){
                if(validators.hasOwnProperty(validator)){
                   validator = validators[validator];
                    if(validator.applyTo(scenario)){
                        if(!attribute || validator.validatesAttribute(attribute))
                            validators.push(validator);
                    }
                }
            }

            return validators;
        },
        getValidatorList:function(){
            return (this.validators || (this.validators = this.createValidators()));
        },
        createValidators:function(){
            var validators = {};
            for( var rule in this.rules){
                if(this.rules.hasOwnProperty(rule)){
                    rule = this.rules[rule];
                    if(_hasAttributes(rule, 'name', 'attribute')){
                        //TODO:Figure out how do we store them, and how we access.
                        validators[rule.attribute] = rule;
                    }
                }
            }

            return validators;
        },
        addError:function(attribute, error){
            var errors = this.errors[attribute] || (this.errors[attribute] = []);
            errors.push(error);
        },
        addErrors:function(errors){
            var error, attribute;
            for( attribute in errors){
                if(errors.hasOwnProperty(attribute)){
                    error = errors[attribute];
                    if(_isArray(error)) this.addErrors(error);
                    else this.addError(attribute, error);
                }
            }
        },
        clearErrors:function(attr){
            if(attr && attr in this.errors) delete this.errors[attr];
            else this.errors = {};
        },
        hasError:function(attribute){
            return this.errors.hasOwnProperty(attribute);
        },
        hasErrors:function(attribute){
            if(attribute) return this.hasError(attribute);
            else return _isEmpty(this.errors);
        },
        getErrors:function(attribute){
            var errors;
            if(attribute) errors = (this.errors[attribute] || []).concat();
            else errors = _merge({},this.errors);
            return errors;
        },
        getError:function(attribute){
            return this.hasError(attribute) ? this.errors[attribute][0] : void(0);
        },
    ////////////////////////////////////////////////////////
        /**
         * It will load all values provied in attr object
         * into the record.
         *
         */
        load:function(attr){
            var key, value, prop;
            // var attributes = this.getAttributeNames();
            //we need to filter the stuff we load (?)

            //TODO: Should we validate?!
            for(key in attr){
                if(attr.hasOwnProperty(key)){
                    // console.log('We go for key: ', key);
                    value = attr[key];
                    if(typeof value === 'object') this.load(value);
                    else if(_isFunc(this[key])) this[key](value);
                    else this[key] = value;
                }
            }
            return this;
        },
        /**
         * Repopulates the record with the latest data.
         * It's an asynchronous mehtod.
         *
         *
         */
        restore:function(){
            //Not really, we still want to get original src.
            // if(this.isNewRecord()) return this;

            //TODO: load clean.attributes instead.
            //We need to use gid, since id might not be set.
            var original =  this.constructor.findByGid(this.gid);
            this.load(original.getAttributes());

            //If we return this, wouldn't it be the same?
            return original;
        },
        get:function(attribute){

            return this[attribute];
        },
        set:function(attribute, value, options){
            var old = this[attribute];
            this[attribute] = value;

            //TODO: We should store changes and mark fields
            //as dirty. (?)

            //TODO: We should handle validation here as well.

            if(!options || !options.silent )
                this.publish('update.'+attribute,{old:old, value:value},options);

            return this;
        },
        has:function(attribute){

            return this.hasOwnProperty(attribute);
        },
        setScenario:function(scenario){
            if(!scenario || scenario === this.scenario) return;
            this.scenario = scenario;
            return this;
        },
        getScenario:function(){

            return this.scenario;
        },
        duplicate:function(asNewRecord){
            var result = new this.constructor(this.getAttributes());

            if(asNewRecord === false) result.gid = this.gid;
            else delete result.id;

            return result;
        },
        clone:function(){

            return _createObject(this);
        },
        hasAttribute:function(attribute){

            return this.getAttributeNames().indexOf(attribute) !== -1;
        },
        getAttributeNames:function(){
            return this.constructor.attributes.concat();
            //var attrs = this.constructor.attributes;
            //return _getKeys(attrs);
        },
        getAttributes:function(names){
            var name, attrs = this.getAttributeNames();

            if(names && _isArray(names)) attrs = _intersect(attrs,names);
            var i = 0, l = attrs.length, res = {};

            for(; i < l; i++ ){
                name = attrs[i];
                if( name in this) res[name] = _result(this, name);
            }

            if(this.id) res.id = this.id;

            return res;
        },
        //TODO: Check that name is in accepted attrs.
        updateAttribute:function(name, value, options){
            var old = this[name];
            this[name] = value;

            //TODO: update:name to follow conventions.
            this.publish('update.'+name,{old:old, value:value},options);

            return this.save(options);
        },
        updateAttributes:function(values, options){
            //TODO: Should we only do this if we have subscribers?
            //if(this.willPublish('updateAttributes'))
            var old = this.getAttributes();
            this.load(values);
            //TODO: update:all?attributes
            this.publish('update.attributes',{old:old, values:values},options);

            return this.save(options);
        },
        isNewRecord:function(){

            return ! this.isRecord();
        },
        isEqual:function(record){
            if(!record)
                return false;
            if(record.constructor !== this.constructor)
                return false;
            if(record.gid !== this.gid)
                return false;
            if(record.id !== this.id)
                return false;

            return true;
        },
        isValid:function(){

            return this.validate();
        },
        isInvalid:function(){

            return ! this.validate();
        },
        isRecord:function(){
            //TODO: this.collection.has(this.id);
            return this.id && this.id in this.constructor.records;
        },
        toString:function(){
            return '['+this.__name__+' => '+" ]";
            //return "<" + this.constructor.className + " (" + (JSON.stringify(this)) + ")>";
        },
        toJSONString:function(){
            return JSON.stringify(this.getAttributes());
        },
        toJSON:function(){

            return this.getAttributes();
        },
        fromJSON:function(records){

            return this.load(records);
        }
    });
    
    Model.include(namespace.PubSub.mixins['pubsub']);

    //TODO: Parse attributes, we want to have stuff
    //like attribute type, and validation info.
    Model.prototype.metadata = function(meta){

    };


    /**
     *
     *
     */
    Model.prototype.fromForm = function(selector, keyModifier){
        var inputs = $(selector).serializeArray();
        var i = 0, l = inputs.length;
        var name, key, result = {};
        keyModifier = keyModifier || new RegExp("(^"+this.modelName+"\\[)(\\w+)(\\]$)");

        for(; i < l; i++){
            key = inputs[i];
            name = key.name.replace(keyModifier, "$2");
            result[key.name] = key.value;
        }

        this.load(result);

        return this;
    };


/////////////////////////////////////////////////////
//// ACTIVE RECORD
//// relational: https://github.com/lyonbros/composer.js/blob/master/composer.relational.js
/////////////////////////////////////////////////////
    var ActiveRecord = Module('ActiveRecord', Model).extend({

        extended:function(){
            //This works OK, it gets called just after it
            //has been extended.

            this.stores = [];
        },
////////////////////////////////////////////////////////////////////////
//////// PERHAPS MOVE THIS INTO A STORE IMP.?
//////// WE CAN HAVE LOCALSTORE, RESTSTORE, ETC...
////////////////////////////////////////////////////////////////////////
        ensureDefaultOptions:function(options){
            options = options || {};

            if(!_isFunc(options, 'onError'))
                options.onError = this.proxy(this.onError);
            

            return options;
        },
        onError:function(model, errorThrown, xhr, statusText){
            console.log(this.__name__+' error: '+errorThrown, ' status ', statusText);
        },
        getService:function(){
            if(!this._service)
                this._service = new jii.REST();
            return this._service;
        },
        setService:function(factory){
            //
            var args = Array.prototype.slice.call(arguments,1);
            args.unshift(this);
            this._service = factory.apply(factory, args);

            return this;
        },
        service:function(action, model, options){
           options = this.ensureDefaultOptions(options);

            this.getService().service(action, model, options);
        },
        update:function(id, attributes, options){
            var record = this.find(id);
            if(record) record.updateAttributes(attributes, options);
            else return null;

            return record;
        },
        create:function(attributes, options){
            options = this.ensureDefaultOptions(options);

            var record = new this(attributes);
            //Perhaps, instead of save, we need to load
            //the attributes, we dont want to trigger an
            //update/create here!
            options.skipSync = true;
            return record.save(options);
        },
        destroy:function(id, options){
            var record = this.find(id);
            if(record) record.destroy(options);
            return record;
        },
        change:function(){
           /* if(_isFunc(callbackOrParams)){
                // return this.bind('change', callbackOrParams);
            } else {
                // return this.publish('change', callbackOrParams);
            }*/
        },
        fetch:function(id, options){
            //TODO: Here, we can have:
            // id => fk, options REST options
            // id => object being SEARCH query.
            options = this.ensureDefaultOptions(options);

            var model = new this();

            if(id) model.id = id;

            var self = this;
            options.onSuccess = function(data){
                console.log('on fetch success ',arguments);
                //we should ensure that data is in the right
                //format.
                //if(typeof data === 'object')
                //self.load(data);
                self.fromJSON(data);

            };
            
            this.service('read', model, options);
        },
        find:function(idOrGid){
            var record = this.records[idOrGid];

            if(!record && this.isGid(idOrGid))
                return this.findByGid(idOrGid);

            if(!record) return false;

            return record.clone();
        },
        findByPk:function(id){
            var record = this.records[id];

            if(!record) return false;

            return record.clone();
        },
        findByGid:function(gid){
            var record = this.grecords[gid];
            if(! record) return false;
            return record.clone();
        },
        exists:function(id){

            return this.findByPk(id) !== false;
        },
        reload:function(values, options){
            options = options || {};

            if(options.clear) this.reset();

            var records = this.fromJSON(values);

            if(!_isArray(records)) records = [records];

            var record;
            var i = 0, l = records.length;
            for(; i < l; i++){
                record = records[i];
                //record.id || (record.id = record.gid);
                if(record['id'] )this.records[record.id] = record;
                this.grecords[record.gid] = record;
            }

            this.publish('reload', this.clonesArray(records));
            return this;
        },
        select:function(filter){
            var result = (function(){
                var r = this.records;
                var record;
                var results = [];
                for( var id in r){
                    if(r.hasOwnProperty(id)){
                        record = r[id];
                        if(filter(record))
                            results.push(record);
                    }
                }
                return results;
            }).call(this);

            return this.clonesArray(result);
        },
        findByAttribute:function(attr, value, grecords){
            var r = grecords? this.grecords : this.records;
            var record, id, rvalue;
            for( id in r){
                if(r.hasOwnProperty(id)){
                    record = r[id];
                    rvalue = _result(record,attr);
                    if( rvalue === value)
                        return record.clone();
                }
            }

            return null;
        },
        findAllByAttribute:function(name, value, options){
            return this.select(function(item){
                var rvalue = _result(item, name);
                return ( rvalue === value);
            });
        },
        deleteAll:function(){
            var r = this.records;
            var key, value;
            var result = [];
            for( key in r){
                if(r.hasOwnProperty(key)){
                    value = r[key];
                    result.push(delete this.records[key]);
                }
            }

            return result;
        },
        destroyAll:function(){
            var r = this.records;
            var key, value, result = [];
            for( key in r){
                if(r.hasOwnProperty(key)){
                    value = r[key];
                    result.push(this.records[key].destroy());
                }
            }

            return result;
        }
    }).include({
        service:function(){
            this.ctor.service.apply(this.ctor, arguments);
        },

        refresh:function(){

        },
        fetch:function(options){
            options = options || {};
            var model = this;
            var successCallback = options.onSuccess;
            options.onSuccess = function(resp, status, xhr){
                //handle response data
                model.load(resp);
                if(successCallback) successCallback(model, resp, options);
            };

            this.service('read',this, options);

            return this;
        },
        save:function(options){
            options = options || {};
            console.log('=============== SAVE');
            //Validate unless told not to.
            if(options.validate !== false){
                if(this.isInvalid())
                    this.publish('error',options);
            }

            this.publish('beforeSave');

            var action = this.isNewRecord() ? 'create' : 'update';

            //TODO: Refactor this!!!!
            if(action === 'update' ) options.skipSync = true;

            var record = this[action](options);

            this.publish('save', options);

            return record;
        },
        create:function(options){
            options = options || {};
            this.publish('beforeCreate',options);
            // if(!this.id) this.id = this.gid;

            var record = this.duplicate(false);

            //TODO: this.collection.add(this.id)
            if(this.has('id')) this.constructor.records[this.id]    = record;
            this.constructor.grecords[this.gid] = record;
            // this.constructor.add(this);

            var clone = record.clone();
            clone.publish('create', options);

            console.log('::::::::::::::::::::::::::::::: ', arguments.callee.caller);
            if(options.skipSync) this.service('create', this, options);

            this.setScenario('update');
            return clone;
        },
        update:function(options){
            if(this.isNewRecord())
            {
                console.log("JII","Cannot update record, is new.");
                return;
            }

            options = options || {};
            this.publish('beforeUpdate',options);

            //TODO: this.collection.get(this.id);
            var record  = this.constructor.records[this.id];
            record.load(this.getAttributes());

            var clone = record.clone();

            if(options.skipSync) this.service('update',this, options);

            this.publish('update', options);

            return clone;
        },
        destroy:function(options){
            options = options || {};

            this.publish('beforeDestroy', options);
            if(options.skipDestroy) return this;

            var model = this;
            var successCallback = options.onSuccess;
            options.onSuccess = function(resp){
                if(successCallback) successCallback(model, resp, options);
            };

            this.service('destroy', this, options);

            this.publish('destroy', options);
            this.destroyed = true;
            // this.unbind();

            return this;
        }
    });
/////////////////////////////////////////////////////
//// SYNC LAYER
/////////////////////////////////////////////////////


/////////////////////////////////////////////////////

    namespace[exportName]  = Model;
})(jii, 'Model', 'Module', 'PubSub');
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

    var LocalStore = Module(exportName).include({
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

return jii;

})("jii");
