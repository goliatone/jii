(function(namespace, exportName, moduleName){
	var Module = namespace[moduleName];

	
//////////////////////////////////////////////////////
// SIMPLE LOGGER: TODO should we create it's own module?
// also,
//////////////////////////////////////////////////////
	var simpleLogger = (function(){

		var _label = '';
		var _enabled = true;

		var _proxyConsoleMethod = function(target, method){
			target[method] = function(){
				if(!_enabled) return;
				target.log(method);
				console[method].apply(console,arguments);
			};
		};
		
		var _formatTime = function(){
			var d = this.d || (this.d = new Date());
			return d.getHours()+':'+ d.getMinutes()+':'+d.getMilliseconds();
		};

		var logger = {
			enable:function(enabled){
				if(typeof enabled === 'undefined')
					enabled = !_enabled;
				_enabled = enabled;
				return this;
			},
			label:function(l){
				if(l) _label = l;
				return this;
			},
			log:function(){
				console.log('proto ',this);
				if(!_enabled) return;
				var label = '[ MSG: '+_label+ _formatTime()+' ]';
				var args  = Array.prototype.splice.call(arguments,0);
				console.log.apply(console, [label].concat(args));
				return this;
			}
		};
		var cm = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'markTimeline', 'profile', 'profileEnd', 'markTimeline', 'table', 'time', 'timeEnd', 'timeStamp', 'trace', 'warn'];
		for(var i=0;i<cm.length;i++){
			_proxyConsoleMethod(logger, cm[i]);
		}

		return logger;
	})();

	var pubsub = namespace.PubSub.mixins['pubsub'];
	var BaseModule = Module(exportName).include(pubsub);

	BaseModule.log = simpleLogger.log;
	BaseModule.logger = simpleLogger;

	BaseModule.prototype.logger = simpleLogger;
	BaseModule.prototype.log = BaseModule.fn.logger.log;

	namespace[exportName] = BaseModule;

})(jii, 'BaseModule','Module');