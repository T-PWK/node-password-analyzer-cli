#!/usr/bin/env node

var program = require('commander');
var chalk = require('chalk');
var fs = require('fs');
var pkg = require('../package.json');
var analyzer = require('password-analyzer');

var input, style = chalk.green;

program
	.version(pkg.version)
	.usage('[options] <file>')
	.option('-o, --output <file>', 'analysis output file')
	.option('-c, --config <file>', 'configuration file')
	.option('-n, --num <num>', 'number of passwords to analyse', parseInt, -1)
	.parse(process.argv);

console.log(program)

if(program.args.length === 0) {
	program.help();
}

if(program.args.length > 1) {
	error('  Error: too many input files');
}

if(program.config && !fs.existsSync(program.config)) {
	error("  Error: configuration '%s' file does not exist", program.config);
}

console.log(style(" ,------.                                                   ,--."));
console.log(style(" |  .--. ' ,--,--. ,---.  ,---. ,--.   ,--. ,---. ,--.--. ,-|  |"));
console.log(style(" |  '--' |' ,-.  |(  .-' (  .-' |  |.'.|  || .-. ||  .--'' .-. |"));
console.log(style(" |  | --' \\ '-'  |.-'  `).-'  `)|   .'.   |' '-' '|  |   \\ `-' |"));
console.log(style(" `--'      `--`--'`----' `----' '--'   '--' `---' `--'    `---'"));
console.log(style("   ,---.                  ,--."));
console.log(style("  /  O  \\ ,--,--,  ,--,--.|  |,--. ,--.,-----. ,---. ,--.--."));
console.log(style(" |  .-.  ||      \\' ,-.  ||  | \\  '  / `-.  / | .-. :|  .--'"));
console.log(style(" |  | |  ||  ||  |\\ '-'  ||  |  \\   '   /  `-.\\   --.|  |"));
console.log(style(" `--' `--'`--''--' `--`--'`--'.-'  /   `-----' `----'`--'"));
console.log(style("                              `---'"), chalk.white(' v.' + pkg.version))

var analyzer = new analyzer.PasswordAnalyzer();
console.log(analyzer.getResults());


function error() {
	var args = Array.prototype.slice.call(arguments, 0);
	args[0] = chalk.red(args[0]);

	console.log.apply(console, args);
	program.help();
}
