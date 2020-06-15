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
		document.getElementById("codeTo").innerText = newValue;
	},
	set error(newValue) {
		document.getElementById("error").innerText = newValue;
	}
};

const DataTypes = {
	INT: "int",
	FLOAT: "float",
	DOUBLE: "double",
	CHAR: "char",
	STRING: "string",
	cSharp: (dataType) => { 
		switch(dataType) {
			case "":
				return "object"
			break;
			default:
				return dataType;
			break;
		}
	},
	typeScript: (dataType) => { 
		switch(dataType) {
			case DataTypes.INT:
			case DataTypes.FLOAT:
			case DataTypes.DOUBLE:
				return "number";
			break;
			case DataTypes.CHAR:
			case DataTypes.STRING:
				return "string";
			break;
			case "":
				return "any"
			break;
			default:
				return dataType;
			break;
		}
	} 
};


const XMLOptions = {
	dataType: "type",
	accessModifier: "access",
};

const convertXMLToJSON = (XMLObject) => {
	let code = JSONCode({});
	const main = XMLObject.documentElement;
	
	if(main.tagName === "parsererror") {
		values.error = "The xml parsing may have failed";
	}

	code.name = main.tagName;
	code.accessModifier = main.getAttribute(XMLOptions.accessModifier);

	const members = [];

	for(const child of main.children){
		const member = JSONCode({});
		member.name = child.tagName;
		member.accessModifier = child.getAttribute(XMLOptions.accessModifier);
		member.dataType = child.getAttribute(XMLOptions.dataType);
		members.push(member);
	}

	code.members = members;
	return code;
};

const JSONOptions = {
	name: "name",
	accessModifier: "access-modifier",
	dataType: "data-type",
	members: "members"
}

const JSONCode = (JSONObject) => ({
	get raw() { return JSONObject; },

	get dataType() { return JSONObject[JSONOptions.dataType] || ""; },
	set dataType(newValue) { JSONObject[JSONOptions.dataType] = newValue; },

	get accessModifier() { return JSONObject[JSONOptions.accessModifier] || "public"; },
	set accessModifier(newValue) { JSONObject[JSONOptions.accessModifier] = newValue; },

	get name() { return JSONObject[JSONOptions.name] || "NoName"; },
	set name(newValue) { JSONObject[JSONOptions.name] = newValue; },

	get members() { return (JSONObject[JSONOptions.members] || []).map(member => JSONCode(member)); },
	set members(newValue) { JSONObject[JSONOptions.members] = (newValue || []).map(member => member.raw); },
});

const pascalCase = (input) => `${input[0].toUpperCase()}${_.camelCase(input.substring(1))}`

const convertJSONToCSharp = (code) => {
	let cSharpCode = "";

	cSharpCode += `${code.accessModifier.toLowerCase()} class ${pascalCase(code.name)} {\n`;			
	
	code.members.forEach(member => {
		cSharpCode += `\t${member.accessModifier.toLowerCase()} ${DataTypes.cSharp(member.dataType)} ${pascalCase(member.name)} { get; set; }\n`;	
	});

	cSharpCode += "}";

	return cSharpCode;
};

const convertJSONToTypeScript = (code) => {
	let typeScriptCode = "";

	const members = code.members;

	const shouldBeClass = members.findIndex(member => member.accessModifier.toLowerCase() !== "public" && member.accessModifier !== "") !== -1;

	typeScriptCode += `${code.accessModifier.toLowerCase() === "public" ? "export" : ""} ${shouldBeClass ? "class" : "interface"} ${pascalCase(code.name)} {\n`;			
	
	members.forEach(member => {
		const accessModifier = member.accessModifier.toLowerCase();
		typeScriptCode += `\t${accessModifier !== "public" ? accessModifier : "" } ${_.camelCase(member.name)}: ${DataTypes.typeScript(member.dataType)};\n`;	
	});

	typeScriptCode += "}";

	return typeScriptCode;
};

const generateModel = () => {
	
	if(values.codeFrom === "") {
		values.codeTo = "";
		return;
	}

	try {
		values.error = "";
		let intermediateJSON;
		switch(values.codeFromType) {
			case "xml":
				intermediateJSON = convertXMLToJSON(new DOMParser().parseFromString(values.codeFrom , "text/xml"));
			break;
			case "json":
				intermediateJSON = JSONCode(JSON.parse(values.codeFrom));
			break;
		}
		let finalCodeTo;
		switch(values.codeToType) {
			case "csharp":
				finalCodeTo = convertJSONToCSharp(intermediateJSON);	
			break;
			case "typescript":
				finalCodeTo = convertJSONToTypeScript(intermediateJSON);	
			break;
		}
		values.codeTo = finalCodeTo;
		document.querySelectorAll("pre code").forEach(block => hljs.highlightBlock(block));
	}
	catch (e) {
		values.error = e;
		throw e;
	}
};
