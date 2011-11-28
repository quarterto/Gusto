importPackage(java.io);
require("extend.js").extend(Object,String,Array,Boolean,JSON);
exports.buffer = (function() {
	var buffer;
	return {
		get: function() buffer,
		set: function(b) buffer = b
	}
}());
exports.stream = (function() {
	var stream;
	return {
		get: function() stream,
		set: function(b) stream = b
	}
}());

exports.init = function(tmpl,template) {
	if(Object.isString(this)) {
		var name = new File(this).getName(),
		    base = name.substr(0,name.length()-3);
	}
	return {
		fromFiles: function(folder,skip) {
			var files = new File(folder).listFiles()
			                .filter(function(f) f.getName().substr(-3) == ".js"),
			    objects = {};
			for each(let file in files) {
				if(file.getName() === skip) continue;
				let basename = file.getName().substring(0,file.getName().length()-3)
				objects[basename] = require(file.getPath())[basename];
			}
			return objects;
		},
		isModel: function(m) this.fromFiles("app/models").indexOf(m) !== -1,
		isController: function(m) this.fromFiles("app/controllers").indexOf(m) !== -1,
		isAction: function(m) Object.isFunction(m) && "id" in m,
		enum: "yo bitches I'm an enum",
		models: function(id) this.fromFiles("app/models",id),
		yes: function() true,
		no: function() false,
		controllers: function(id) this.fromFiles("app/controllers",id),
		controller: function(actions) {
			if(Object.isFunction(actions)) {
				actions = actions(this.fromFiles("app/models")[base.substr(0,base.length-1)]);
			}
			var spec = {
				"redirect": function(path) {
					return {status:302,headers:{"Location":path}}
				},
				"renderJSON": function(action,args) {
					exports.buffer.get().append(JSON.stringify(args));
				},
				"render": function(action,args,other) {
					[action,args] = Object.isString(args) ? [args,other] : [action,args];
					args = Object.isglobal(args) ? {} : args;

					var path = (base ? base+"/" : "")+action,
					    oldpath = '',
					    output,
					    extras = {};
					do {
						oldpath = path;
						try {
							var str = readFile("app/views/"+path+".ejs"),
							    template = tmpl.compile(str);
							output = template.call(Object.extend(args,extras),Object.extend(template, {
									extend: function(daddy) {path = daddy},
									layout:function() output,
									set: function(k,v){extras[k]=v;},
									get: function(k) extras[k],
									exists: function(k) k in extras
								}
							),this.fromFiles("app/controllers"));
						} catch(e) {
							if(output = tmpl.handle(e)) {
								path = "error";
							} else {
								throw e;
							}
						}
					} while(path !== oldpath);
					exports.buffer.get().append(output.toXMLString ?
						output.toXMLString():
						output.toString()
					);
				}
			};
			for each(let [name,action] in Iterator(actions)) {
				let context = {};
				for each(let [k,v] in Iterator(spec)) {
					context[k] = v.bind(context,name);
				}
				action.context = context;
				actions[name] = action.bind(action.context);
				actions[name].inner = action;
				actions[name].id = base+"."+name;
			}
			for each(let [name,action] in Iterator(actions)) {
				actions[name].inner.context = Object.extend(action.inner.context,actions);
			}


			return Object.extend(spec,actions);
		},
		model: function(spec) {
			Object.extend(spec,{id:{type:Number}});
			var dir = (function(f)[f.mkdirs(),f][1])(new File("data/"+base)),
			methods = {
				save: function() {
					var file = FileWriter("data/"+base+"/"+this.id+".json"),
					    buf = new BufferedWriter(file);
					list[this.id] = this;
					buf.write(JSON.stringify(this));
					buf.close();
				}
			}, type = function type(desc,value) {
				var out;
				if(desc.type === Array) {
					out = [];
					for each(let [i,v] in value) {
						out[i] = type({type:desc.elements},v);
					}
				} else if(desc.type === "yo bitches I'm an enum") {
					if(desc.elements.indexOf(value) !== -1) {
						out = value;
					} else if(value in desc.elements) {
						out = desc.elements[value];
					} else {
						throw new TypeError("u mad?")
					}
				} else if(this.isModel(desc.type)) {
					out = desc.type.byId(value);
				} else {
					out = new desc.type(value);
				}
				return out;
			}, make = function(params) {
				var out = Object.extend({},methods);
				for each(let [k,desc] in Iterator(spec)) {
					out[k] = type(desc,params[k]);
				}
				return out;
			},
			list = (dir.listFiles() || []).map(function(file,i,list) {
				return make(JSON.parse(readFile(file)));
			}),
			out = {
				byId: function(id) list[id],
				fetch: function(f) list.filter(f),
				create: function(params) {
					var obj = make(Object.extend(params,{id: list.length}));
					list.push(obj);
					for(let [m,func] in Iterator(methods)) {
						Object.defineProperty(obj,m,{value:func.bind(obj)});
					}
					return obj;
				}
			};
			return out;
		}
	};
}