(function(namespace, exportName, moduleName){

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
//// VALIDATOR
/////////////////////////////////////////////////////
    var Validator = Module('Validator').extend({
        createValidator:function(attributes, name, method, options){
            var ctor = this.prototype.constructor;

            options = _merge(ctor.defaultOptions, (options || {}));

            if(!method && (_isFunc(ctor[name])) )
                method = ctor[name];

            if(method && !_isFunc(method) && _isFunc(method[name]))
                method = method[name];

            if(this.validators[name]) return this.validators[name];
            
            var makeAttributeArray = function(attributes){
                if(typeof attributes === 'string'){
                    attributes = attributes.split(',').map(String.trim);
                }
                return attributes;
            };
            attributes = makeAttributeArray(attributes);

            var Validator = function(){
                var self  = this;
                self.name = name;
                self.attributes = attributes;
                self.message = options.message;
                self.skipOnError = options.skipOnError;

                self.validatesAttribute = function(attr){
                    return self.attributes.indexOf(attr) !== -1;
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
            this.validators[name] = new Validator();
            return this.validators[name];
        },
        
        setMessage:function(validator, message){
            var msgs = (this.messages || (this.messages = {}));
            msgs[validator] = message;
        },
        getMessage:function(validator){
            //TODO: We need to replace values in msg {attribute} etc.
            return this.messages[validator] || this.defaultMessage;
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
    var Model = Module( exportName/*,EventDispatcher*/).include({
        //TODO: Do we want this on the reset method, what about inheritance.
        errors:{},
        validators:{},
        scenario:null,
        init:function(attrs, options){
            this.clearErrors();
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
        }
   
    });

    namespace[exportName] = Validator;

})(jii, 'Validator', 'Module');