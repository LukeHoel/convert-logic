const values = {
	get codeFrom() {
		return document.getElementById("codeFrom").value;
	},
	get codeTo() {
		return document.getElementById("codeTo").value;
	},
	get codeFromType() {
		return document.getElementById("codeFromType").value;
	},
	get codeToType() {
		return document.getElementById("codeToType").value;
	},
	set codeTo(newValue) {
		document.getElementById("codeTo").value = newValue;
	},
	set error(newValue) {
		document.getElementById("error").innerText = newValue;
	}
};

const DataTypes = {
	INT: "int",
	FLOAT: "float",
	DOUBLE: "double"
};

const JSONOptions = {
	type: "type",
	dataType: "data-type",
	classDeclaration: "class-declaration",
	memberProperty: "member-property",
	accessModifier: "access-modifier",
	name: "name",
	children: "children"
};

const JSONCode = (JSONObject) => ({
	get type() { return JSONObject[JSONOptions.type] || ""; },
	get dataType() { return JSONObject[JSONOptions.dataType] || ""; },
	get accessModifier() { return JSONObject[JSONOptions.accessModifier] || ""; },
	get name() { return JSONObject[JSONOptions.name] || ""; },
	get children() { return (JSONObject[JSONOptions.children] || []).map(child => JSONCode(child)); },
});



const convertJSONToCSharp = (JSONObject) => {
	let cSharpCode = "";
	
	code = JSONCode(JSONObject);

	switch(code.type) {
		case JSONOptions.classDeclaration:
			cSharpCode += `${code.accessModifier} class ${code.name} {`;			
			
			code.children.filter(child => child.type === JSONOptions.memberProperty)
			.forEach(child => {
				cSharpCode += `${child.accessModifier} ${child.dataType} ${child.name} { get; set;}`;	
			});

			cSharpCode += "}";

		break;
	}
	return cSharpCode;
};

const convertLogic = () => {
	try {
		let intermediateJSON;
		switch(values.codeFromType) {
			case "json":
				intermediateJSON = JSON.parse(values.codeFrom);
			break;
		}
		let finalCodeTo;
		switch(values.codeToType) {
			case "csharp":
				finalCodeTo = convertJSONToCSharp(intermediateJSON);	
			break;
		}
		values.codeTo = finalCodeTo;
	}
	catch (e) {
		values.error = e;
		throw e;
	}
};
