// list.js
// somewhat of a misnomer. actually invokes the hotloader
const fs = require("fs"),
      path = require("path"),
      hot = require("hot"),
      controller = require("./controller.js"),
      config = require("../main.js").config;
var initialisers = {
	controllers: controller
},
loaders = {};
function fromFiles(thing) {
	// when given a path, sets up the loaders
	var out = {};
	exports[thing] = {};

	fs.readdirSync(path.join(config.appDir,"app",thing)).each(function(file) {
		var base = path.basename(file,".js"),
		init = thing in initialisers ?
			initialisers[thing] :
			function(a){return a;};
		function save(module) {
			// exports the hot.js-loaded modules exported
			out[base] = exports[thing][base] = init.call(base,module);
		}
		if(path.extname(file) == '.js') {
			exports[thing].__defineGetter__(base,function() {
				// only actually load the module when it's requested
				// (avoids circular dependency issues)
				if(!(base in loaders)) {
					loaders[base] = new hot.load(
						path.join(config.appDir,"app",thing,file)
					).on("reload",save);
				}
				return init.call(base,loaders[base].module);
			});
		}
	});
}
// load the things
fromFiles("controllers");
fromFiles("models");
fromFiles("filters");

exports.isAction = function(func) {
	var id = Object.isString(func) ? func : func.id;
	return exports.controllers.values().some(function(cont) {
		return cont.values().map("id").some(id);
	});
};