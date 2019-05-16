module.exports = (args) => {
	let aux = ""
	for (let i = 2; i < args.length; i++) {
		aux += args[i]+'&';
	}

	return aux
}