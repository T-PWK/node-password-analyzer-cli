#!/usr/bin/env node

var program = require('commander');
var chalk = require('chalk');
var fs = require('fs');
var pkg = require('../package.json');
var format = require('util').format;
var analyzer = require('password-analyzer');
var reader = require('node-line-reader');
var Table = require('cli-table');

var input, style = chalk.green, masks = [];
var borders = { 'top': '' , 'top-mid': '' , 'top-left': '' , 'top-right': ''
         , 'bottom': '' , 'bottom-mid': '' , 'bottom-left': '' , 'bottom-right': ''
         , 'left': '' , 'left-mid': '' , 'mid': '' , 'mid-mid': ''
         , 'right': '' , 'right-mid': '' , 'middle': '' }

program
	.version(pkg.version)
	.usage('[options] <file>')
	.option('-c, --config <file>', 'configuration file')
	.option('-m, --mask <mask>', 'password analysis mask(s)', collect, [])
	.option('--months', 'months analyzer')
	.option('--lengths', 'length analyzer')
	.option('--numeric', 'numeric analyzer')
	.option('--upper', 'uppercase letters analyzer')
	.option('--lower', 'lowercase letters analyzer')
	.option('--lowerupper', 'lowercase and uppercase letters analyzer')
	.option('-n, --num <num>', 'number of passwords to analyse', parseInt, -1)
	.parse(process.argv);

if(program.args.length === 0) {
	program.help();
}

if(program.args.length > 1) {
	error('  Error: too many input files');
}

if(program.config && !fs.existsSync(program.config)) {
	error("  Error: configuration '%s' file does not exist", program.config);
}

out();
out(style(" ,------.                                                   ,--."));
out(style(" |  .--. ' ,--,--. ,---.  ,---. ,--.   ,--. ,---. ,--.--. ,-|  |"));
out(style(" |  '--' |' ,-.  |(  .-' (  .-' |  |.'.|  || .-. ||  .--'' .-. |"));
out(style(" |  | --' \\ '-'  |.-'  `).-'  `)|   .'.   |' '-' '|  |   \\ `-' |"));
out(style(" `--'      `--`--'`----' `----' '--'   '--' `---' `--'    `---'"));
out(style("   ,---.                  ,--."));
out(style("  /  O  \\ ,--,--,  ,--,--.|  |,--. ,--.,-----. ,---. ,--.--."));
out(style(" |  .-.  ||      \\' ,-.  ||  | \\  '  / `-.  / | .-. :|  .--'"));
out(style(" |  | |  ||  ||  |\\ '-'  ||  |  \\   '   /  `-.\\   --.|  |"));
out(style(" `--' `--'`--''--' `--`--'`--'.-'  /   `-----' `----'`--'"));
out(style("                              `---'"), chalk.white(' v.' + pkg.version))

// Setting up password analyzer

var passwdAnalyzer = new analyzer.PasswordAnalyzer();

if(program.lengths) {
	passwdAnalyzer.addGroup('Length', 'bylength');
}

if(program.months) {
	passwdAnalyzer.addGroup('Months', 'months');
}

if(program.numeric) {
	passwdAnalyzer.addGroup('Character Set', 'numeric');
}

if(program.upper) {
	passwdAnalyzer.addGroup('Character Set', 'upperalpha');
}

if(program.lower) {
	passwdAnalyzer.addGroup('Character Set', 'loweralpha');
}

if(program.lowerupper) {
	passwdAnalyzer.addGroup('Character Set', 'lowerupperalpha');
}

program.mask.forEach(function (mask) {
	passwdAnalyzer.addGroup('Advanced Masks', new analyzer.analyzers.MaskAnalyzer(mask));
});

// Passwords analysis

var file = fs.createReadStream(program.args[0]);
var stream = new reader.LineTransform();
var filter = new reader.LineFilter({ skipEmpty: true });

file.pipe(stream).pipe(filter);

filter.on('data', function (passwd) {
	passwdAnalyzer.analyze(passwd);
});

filter.on('end', function () {
	var results = passwdAnalyzer.getResults();
	var headTable = new Table({ chars: borders });
	var table = new Table({ head: ['Group Name', 'Analyzer Code', 'Count', '%'], chars: borders });

	headTable.push(
		{ 'Analyzing passwords in': program.args[0] },
		{ 'Analyzing number of passwords': formatNumber(results.total) }
	);

	out();
	out();
	out(headTable.toString());
	out();
	out();

	results.groups.forEach(function (group) {
		table.push(['']);
		table.push([group.name])

		group.analyzers.forEach(function (analyzer) {
			table.push([
				'', analyzer.code, formatNumber(analyzer.count), (analyzer.count / results.total * 100).toFixed(1) + '%'
			]);
		});
	});

	out(table.toString());
	out();
});

function formatNumber (num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
}

function collect(val, memo) {
	memo.push(val);
	return memo;
}

function out () {
	var args = Array.prototype.slice.call(arguments, 0);
	console.log.apply(console, args);
}

function warning (argument) {
	var args = Array.prototype.slice.call(arguments, 0);
	args[0] = chalk.yellow(args[0]);

	console.log.apply(console, args);
}

function error() {
	var args = Array.prototype.slice.call(arguments, 0);
	args[0] = chalk.red(args[0]);

	console.log.apply(console, args);
	program.help();
}
