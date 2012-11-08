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