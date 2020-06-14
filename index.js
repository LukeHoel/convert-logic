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
	dataType: "data-type",
	accessModifier: "access-modifier",
	name: "name",
	members: "members"
};

const JSONCode = (JSONObject) => ({
	get type() { return JSONObject[JSONOptions.type] || ""; },
	get dataType() { return JSONObject[JSONOptions.dataType] || ""; },
	get accessModifier() { return JSONObject[JSONOptions.accessModifier] || ""; },
	get name() { return JSONObject[JSONOptions.name] || ""; },
	get members() { return (JSONObject[JSONOptions.members] || []).map(member => JSONCode(member)); },
});



const convertJSONToCSharp = (JSONObject) => {
	let cSharpCode = "";
	
	code = JSONCode(JSONObject);

	cSharpCode += `${code.accessModifier} class ${code.name} {`;			
	
	code.members.forEach(member => {
		cSharpCode += `${member.accessModifier} ${member.dataType} ${member.name} { get; set;}`;	
	});

	cSharpCode += "}";

	return cSharpCode;
};

const generateModel = () => {
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
