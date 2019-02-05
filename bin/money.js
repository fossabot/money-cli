'use strict';

const got = require('got');
const cash = require('money');
const chalk = require('chalk');
const ora = require('ora');
const Conf = require('conf');
const currencies = require('../lib/currencies.json');

const config = new Conf();

// API Source
const API = `http://data.fixer.io/api/latest?access_key=${config.get('key')}`;

const money = async command => {
	const {amount} = command;
	const from = command.from.toUpperCase();
	const to = command.to.filter(item => item !== from).map(item => item.toUpperCase());

	console.log();
	const loading = ora({
		text: 'Converting...',
		color: 'green',
		spinner: {
			interval: 150,
			frames: to
		}
	});

	loading.start();

	await got(API, {
		json: true
	}).then(response => {
		cash.base = response.body.base;
		cash.rates = response.body.rates;

		to.forEach(item => {
			if (currencies[item]) {
				loading.succeed(`${chalk.green(cash.convert(amount, {from, to: item}).toFixed(3))} ${`(${item})`} ${currencies[item]}`);
			} else {
				loading.warn(`${chalk.yellow(`The "${item}" currency not found `)}`);
			}
		});

		console.log(chalk.underline.gray(`\nConversion of ${chalk.bold(from)} ${chalk.bold(amount)}`));
	}).catch(error => {
		if (error.code === 'ENOTFOUND') {
			loading.fail(chalk.red('Please check your internet connection!\n'));
		} else {
			loading.fail(chalk.red('Internal server error :(\n'));
		}
		process.exit(1);
	});
};

module.exports = money;
