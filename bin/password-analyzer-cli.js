#!/usr/bin/env node

var program = require('commander');
var fs = require('fs');
var pkg = require('../package.json');
var analyzer = require('password-analyzer');
var LineTransform = require('node-line-reader').LineTransform;

program
  .version(pkg.version)
  .usage('[options] <file>')
  .option('-o, --output <file>', 'analysis output file')
  .option('-c, --config <file>', 'configuration file')
  .option('-n, --num <num>', 'number of passwords to analyze', parseInt, -1)
  .parse(process.argv);

verify();

// Setup password analyzer
var passwordAnalyzer = new analyzer.PasswordAnalyzer();

passwordAnalyzer.addGroup('Character sets', ['numeric', 'loweralpha', 'upperalpha']);
passwordAnalyzer.addGroup('Months', ['months']);

// Setup input stream
var stream = fs.createReadStream(program.args[0]);
var transform = new LineTransform({ skipEmpty: true });

stream.pipe(transform);

transform.on('data', function (password) {
  if (password.length === 0) return;
  passwordAnalyzer.analyze(password);
});

transform.on('end', function () {
  console.log(passwordAnalyzer.getResults());
});

console.log(",------.                                                   ,--.");
console.log("|  .--. ' ,--,--. ,---.  ,---. ,--.   ,--. ,---. ,--.--. ,-|  |");
console.log("|  '--' |' ,-.  |(  .-' (  .-' |  |.'.|  || .-. ||  .--'' .-. |");
console.log("|  | --' \\ '-'  |.-'  `).-'  `)|   .'.   |' '-' '|  |   \\ `-' |");
console.log("`--'      `--`--'`----' `----' '--'   '--' `---' `--'    `---'");
console.log("  ,---.                  ,--.");
console.log(" /  O  \\ ,--,--,  ,--,--.|  |,--. ,--.,-----. ,---. ,--.--.");
console.log("|  .-.  ||      \\' ,-.  ||  | \\  '  / `-.  / | .-. :|  .--'");
console.log("|  | |  ||  ||  |\\ '-'  ||  |  \\   '   /  `-.\\   --.|  |");
console.log("`--' `--'`--''--' `--`--'`--'.-'  /   `-----' `----'`--' v." + pkg.version);
console.log("                             `---'")


function error () {
  var args = [].slice.apply(arguments);
  console.log('');
  console.log.apply(console, args);
  console.log('');
  program.help();
}

function verify () {
  // Input verification
  if(program.args.length === 0) {
    error("  Error: no input file");
  }

  if(program.args.length > 1) {
    error("  Error: too many input files");
  }

  if(program.config && !fs.existsSync(program.config)) {
    error("  Error: specified configuration file '%s' does not exist", program.config); 
  }
}
