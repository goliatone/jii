(function(namespace, exportName){
    namespace  = namespace  || this;
    exportName = exportName || 'Model';
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
        console.log(obj);
        if( obj.hasOwnProperty('length') && obj.length === 0) return true;
        var key;
        for(key in obj) {
            if (obj.hasOwnProperty(key)) return false;
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
        if (o !== Object(o)) return null;
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

    var _map = function(fun /*, thisp*/)
    {
        var len = this.length;
        if (typeof fun != "function")
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
        for(var p in b) a[p] = b[p];
        return a;
    };

    var _intersect = function(a,b){
        a.filter(function(n){ return (b.indexOf(n) !== -1);});
    };

/////////////////////////////////////////////////////
//// VALIDATOR
/////////////////////////////////////////////////////
    var Validator = Class('Validator').extend({
        createValidator:function(attributes, name, method, options){
            var ctor = this.prototype.constructor;

            options = _merge(ctor.defaultOptions, (options || {}));

            if(!method && (_isFunc(ctor[name])) )
                method = ctor[name];

            if(method && !_isFunc(method) && _isFunc(method[nane]))
                method = method[name];

            if(this.validators[name]) return this.validators[name];
            
            var makeAttributeArray = function(attributes){
                if(typeof attributes === 'string'){
                    attributes = attributes.split(',').map(String.trim);
                }
                return attributes;
            };
            attributes = makeAttributeArray(attributes);

            var validator = function(){
                var self  = this;
                self.name = name;
                self.attributes = attributes;
                self.message = options.message;
                self.skipOnError = options.skipOnError;

                self.validatesAttribute = function(attr){
                    return self.attributes.indexOf(attr) != -1;
                };
                self.applyTo = function(scenario){
                    return true;
                };
                self.validate = function(scope){
                    var args = Array.prototype.slice.call(arguments,1);
                    //self.ensureArguments(method, args );
                    var validates = method.apply(scope, args);
                    console.log(this);
                    //we need to add the error:
                    //if(!validates) this.errors = 23;
                    return validates;
                };
            };
            this.validators[name] = new validator();
            return this.validators[name];
        },
        
        setMessage:function(validator, message){
            var msgs = (this.messages || (this.messages = {}));
            msgs[validator] = message;
        },
        getMessage:function(validator){
            //TODO: We need to replace values in msg {attribute} etc.
            return msgs[validator] || this.defaultMessage;
        }

    });
    
    Validator.defaultMessage = "Error.";
    Validator.defaultOptions = {
            message:Validator.defaultMessage,
            skipOnError:false,
            on:[]
        };
    Validator.length = function(attribute, value){
        //
        return this[attribute].length === value;
    };
    Validator.range = function(attribute, min, max){
        //
    };
    Validator.numerical = function(attribute){
        //
        return ! isNaN(this[attribute]);
    };

    Validator.type = function(attribute, value){
        //
    };

    Validator.required = function(attribute){
        //
        return !_isEmpty(this[attribute]);
    };

    Validator.match = function(attribute, match){
        //
    };

    Validator.email = function(attribute){
        //
    };

    Validator.url = function(attribute){
        //
    };

    Validator.compare = function(attribute, value){
        //
    };

    Validator.$in = function(attribute,match){
        //
    };

    Validator.$default = function(attribute,value){
        //
    };

    Validator.exists = function(attribute){
        //
    };
/////////////////////////////////////////////////////

/////////////////////////////////////////////////////
//// MODEL
/////////////////////////////////////////////////////
    /**
     * Model is a glorified Object with pubsub and an interface
     * to deal with attributes, validation
     *
     *
     */
    var Model = Class( exportName/*,EventDispatcher*/).extend({
        records:{},
        grecords:{},
        attributes:[],
        
        configure: function(config){
            this.attributes = config.attributes;
            // this.unbind();
        },
        /*extended:function(self){
            console.log("Extended");
            this.reset();
        },*/
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
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            }).toUpperCase();
        },
        isGid:function(gid){
            if(_isEmpty(gid)) return false;
            // if(typeof gid === obj)
            console.log("isGid ",gid);

            gid = gid.replace(/[A-Z\d]/g,function(){return 0;});
            return (gid === '00000000-0000-0000-0000-000000000000');
        },
        reset:function(options){
            this.records = {};
            this.grecords = {};
        },
        //TODO: HOW DO WE WANT TO HANDLE CLONES AND STORING BY REF?!
        add:function(record,options){
            options = options || {};
            //We need to check that record is a model, if not
            //we make it one. Also, if its a model, we need
            //to return the clone or store the clone?!.

            record.subscribe('all',this._handleModel,this,options);

            console.log("Adding record, with id", record.gid);

            if(record.id)  this.records[record.id]   = record;
            if(record.gid) this.grecords[record.gid] = record;
            //should we register for all updates on model?!
            //that way we can track changes, i.e add it to the dirty
            //list, if id changes, update
            return record;
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
            }
            return id;
        },
        has:function(id){
            id = this.ensureId(id);
            
            //how do we want to handle errors!?
            return _hasOwn(this.records,id) || _hasOwn(this.grecords,id);
        },
        remove:function(id){
            if(!this.has(id)) return null;

            var r = this.get(id);
            
            //remove all listeners
            r.unsubscribe('all',this.proxy(this._handleModel));

            //do remove
            delete this.records[r.id];
            delete this.grecords[r.gid];

            return r;
        },
        _handleModel:function(topic,options){
            console.log('HANDLE FUCKING MODEL: ', topic, options, this);
        },
        
    ////////////////////////////////////////////////////////////
    //// ArrayCollection Stuff.
    ////////////////////////////////////////////////////////////
        each:function(callback){
            var r = this.records;
            var results = [];
            var key, value;
            for(key in r){
                value = r[key];
                results.push(callback(value.clone()));
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
        count:function(){
            return this.recordsValues().length;
        },
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
                value = r[key];
                result.push(value);
            }
            return result;
        }
    }).include({
        //TODO: Do we want this on the reset method, what about inheritance.
        errors:{},
        validators:{},
        scenario:null,
        init:function(attrs){
            this.modelName = _capitalize(this.__name__);
            
            this.clearErrors();

            if(attrs) this.load(attrs);
            

            this.gid = this.ctor.makeGid();

            //We save a copy in static model.
            this.ctor.add(this);

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
                validator = validators[prop];
                //TODO: do we want to register objects or methods?
                //validator.call(this, attributes);
                validator.validate(this, attributes);
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
                validator = validators[validator];
                if(validator.applyTo(scenario)){
                    if(!attribute || validator.validatesAttribute(attribute))
                        validators.push(validator);
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
                rule = this.rules[rule];
                if(_hasAttributes(rule, 'name', 'attribute')){
                    //TODO:Figure out how do we store them, and how we access.
                    validators[rule.attribute] = rule;
                }
            }

            return validators;
        },
        getScenario:function(){
            return this.scenario;
        },
        setScenario:function(scenario){
            this.scenario = scenario;
        },
        addError:function(attribute, error){
            var errors = this.errors[attribute] || (this.errors[attribute] = []);
            errors.push(error);
        },
        addErrors:function(errors){
            var error, attribute;
            for( attribute in errors){
                error = errors[attribute];
                if(_isArray(error)) this.addErrors(error);
                else this.addError(attribute, error);
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
            else errors = _copy(this.errors);
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
            for (key in attr){
                value = attr[key];
                _isFunc(this[key]) ? this[key](value) : (this[key] = value);
            }
            return this;
        },
        get:function(attribute){

        },
        set:function(attribute, value){

        },
        has:function(attribute){

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

            return this.getAttributeNames().indexOf(attribute) != -1;
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

    Model.prototype.metadata = function(meta){

    };


    /**
     *
     *
     */
    Model.prototype.fromForm = function(selector, keyModifier){
        var inputs = $(selector).serializeArray();
        var i = 0, l = inputs.length;
        var name;
        keyModifier = keyModifier || new RegExp("(^"+this.modelName+"\[)(\w+)(\]$)");

        for(; i < l; i++){
            key = inputs[i];
            name = key.name.replace(keyModifier, "$2");
            result[key.name] = key.value;
        }
    };
/////////////////////////////////////////////////////
//// ACTIVE RECORD
/////////////////////////////////////////////////////
    var ActiveRecord = Class('ActiveRecord',Model).extend({
        update:function(id, attrs, options){
            var record = this.find(id);
            if(record) record.updateAttributes(atts, options);
            return record;
        },
        create:function(attrs, options){
            var record = new this(atts);
            return record.save(options);
        },
        destroy:function(id, options){
            var record = this.find(id);
            if(record) record.destroy(options);
            return record;
        },
        change:function(callbackOrParams){
            if(_isFunc(callbackOrParams)){
                return this.bind('change', callbackOrParams);
            } else {
                return this.publish('change', callbackOrParams);
            }
        },
        fetch:function(callbackOrParams){
            if(_isFunc(callbackOrParams)){
                return this.bind('fetch', callbackOrParams);
            } else {
                return this.publish('fetch', callbackOrParams);
            }
        },
        findByPk:function(id){
            var record = this.records[id];

            if(!record && this.isGid(id))
                return this.findByGid(id);

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
        refresh:function(values, options){
            options = options || {};

            if(options.clear) this.reset();

            var records = this.fromJSON(values);

            if(!isArray(records)) records = [records];

            var record;
            var i = 0, l = records.length;
            for(; i < l; i++){
                record = records[i];
                record.id || (record.id = record.gid);
                this.records[record.id] = record;
                this.grecords[record.gid] = record;
            }

            this.publish('refresh', this.clonesArray(records));
            return this;
        },
        select:function(filter){
            var result = (function(){
                var r = this.records;
                var results = [];
                for( var id in r){
                    record = r[id];
                    if(filter(record))
                        results.push(record);
                }
                return records;
            }).call(this);

            return this.clonesArray(result);
        },
        findByAttribute:function(attr, value){
            var r = this.records;
            var record, id, rvalue;
            for( id in r){
                record = r[id];
                rvalue = _result(record,attr);
                if( rvalue === value)
                    return record.clone();
            }

            return null;
        },
        findAllByAttribute:function(name, value){
            return this.select(function(item){
                var rvalue = _result(item, attr);
                return ( rvalue === value);
            });
        },
        deleteAll:function(){
            var r = this.records;
            var key, value;
            var result = [];
            for( key in r){
                value = r[key];
                result.push(delete this.records[key]);
            }

            return result;
        },
        destroyAll:function(){
            var r = this.records;
            var key, value;
            var result = [];
            for( key in r){
                value = r[key];
                result.push(this.records[key].destroy());
            }

            return result;
        }
    }).include({
        /**
         * Repopulates the record with the latest data.
         * It's an asynchronous mehtod.
         *
         *
         */
        reload:function(){
            if(this.isNewRecord())
                return this;

            //TODO: load clean.attributes instead.
            var original =  this.constructor.findByPk(this.id);
            this.load(original.getAttributes());

            //If we return this, wouldn't it be the same?
            return original;
        },
        save:function(options){
            options = options || {};

            //Validate unless told not to.
            if(options.validate !== false){
                if(this.isInvalid())
                    this.publish('error',options);
            }

            this.publish('beforeSave');

            var action = this.isNewRecord() ? 'create' : 'update';
            var record = this[action](options);

            this.publish('save', options);

            return record;
        },
        create:function(options){
            options = options || {};
            this.publish('beforeCreate',options);

            if(!this.id) this.id = this.gid;

            var record = this.duplicate(false);

            //TODO: this.collection.add(this.id)
            this.constructor.records[this.id]    = record;
            this.constructor.grecords[this.gid] = record;

            var clone = record.clone();
            clone.publish('create', options);

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

            this.publish('update', options);

            return clone;
        },
        destroy:function(options){
            options = options || {};

            this.publish('beforeDestroy', options);

            //TODO: Move into ModelCollection.
            delete this.constructor.records[this.id];
            delete this.constructor.grecords[this.gid];

            this.destroyed = true;
            this.publish('destroy', options);
            // this.unbind();

            return this;
        }
    });


    namespace['Validator'] = Validator;
    namespace[exportName]  = Model;
}).call(this);