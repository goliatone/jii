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