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
            if(!objects) return;

            if(typeof objects === 'string'){
                objects = JSON.parse(objects);
            }
            if(_isArray(objects)){
                var result = [];
                var i = 0, l = objects.length;
                var value;
                for(; i < l; i++){
                    value = objects[i];
                    result.push(new this(value));
                }
                return result;
            } else {
                return new this(objects);
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
                    console.log('We go for key: ', key);
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
            //this.reset();
            this.stores = [];
        },
////////////////////////////////////////////////////////////////////////
//////// PERHAPS MOVE THIS INTO A STORE IMP.?
//////// WE CAN HAVE LOCALSTORE, RESTSTORE, ETC...
////////////////////////////////////////////////////////////////////////
        parseUrl:function( template, data){
            function replaceFn() {
                var prop = arguments[1];
                return (prop in data) ? data[prop] : '';
            }
            return template.replace(/\{(\w+)\}/g, replaceFn);
        },
        getService:function(){
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
            //
            // this._service.apply(this, arguments);

            options = options || {};

            console.log('____________________________');
            console.log('SYNC: called with arguments: ',arguments, new Date().valueOf());
            var actionMap = {};
            actionMap['create'] = {
                url:'/api/{model}/',
                type:'POST'
            };
            actionMap['read']   = {
                url:'/api/{model}/',
                type:'GET'
            };
            actionMap['update'] = {
                url:'/api/{model}/{id}',
                type:'PUT'
            };
            actionMap['destroy'] = {
                url:'/api/{model}/{id}',
                type:'DELETE'
            };


            var data = {model:null, action:action,id:model.id};
            data.model = _firstToLowerCase(model.modelName);

            var url = this.parseUrl(actionMap[action].url, data);

            switch(action){
                case 'create':
                    //

                break;

                case 'read':
                    //
                    if(options.id) url = url + options.id;
                break;

                case 'update':
                    //
                break;

                case 'delete':
                case 'destroy':
                    //
                break;

                default:
                    return;

            }
            console.log('url: ',url);
            $.ajax({
                url:url,
                type:actionMap[action].type,
                success:options.success,
                error:function(){console.log('error');}
            });
            console.log('____________________________');
            
        },
        update:function(id, attributes, options){
            var record = this.find(id);
            if(record) record.updateAttributes(attributes, options);
            else return null;

            return record;
        },
        create:function(attributes, options){
            options = options || {};
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
        change:function(callbackOrParams){
            if(_isFunc(callbackOrParams)){
                // return this.bind('change', callbackOrParams);
            } else {
                // return this.publish('change', callbackOrParams);
            }
        },
        fetch:function(id, options, callbackOrParams){
            options = options || {};
            
            if(id) options.id = id;

            var self = this;
            options.success = function(data){
                console.log('on fetch success ',data);
                self.fromJSON(data);

            };

            this.service('read', new this(),options);
            // if(_isFunc(callbackOrParams)){
            //     // return this.bind('fetch', callbackOrParams);
            // } else {

            //     //return this.publish('fetch', callbackOrParams);
            // }
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
            var key, value;
            var result = [];
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
            var successCallback = options.success;
            options.success = function(resp, status, xhr){
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
            var successCallback = options.success;
            options.success = function(resp){
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