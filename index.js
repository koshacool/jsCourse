const request = require('request-promise');
const yargs = require('yargs')
    .usage('Usage: node $0 --username(-u)  --sort(-s) created|updated|pushed|full_name --direction(-d) asc|desc  [--help(-h)]')
    .help('help')
    .alias('help', 'h')
    .describe('help', 'Display info about usage parameters')

    .default('username', 'koshacool')
    .alias('username', 'u')
    .describe('username', 'User name')

    .default('sort', 'full_name')
    .alias('sort', 's')
    .describe('sort', 'Parametr for sort data')
    .choices('sort', ['created', 'updated', 'pushed', 'full_name'])
    .example('node $0 --sort=full_name(-s=full_name)')

    .alias('direction', 'd')
    .describe('direction', 'Parametr for sort data')
    .choices('direction', ['asc', 'desc'])
    .example('node $0 --direction=asc(-d=asc)');

const ACCESS_TOKEN = 'c36b9c0b548d507f600f736948c3acb21924f919';
const REQUEST_URL = 'https://api.github.com/users/' + yargs.argv.username + '/repos';
const printRepository = repository => console.log(repository.full_name);

const options = {
    uri: REQUEST_URL,
    qs: {
        access_token: ACCESS_TOKEN,
        username: yargs.argv.username,
        sort: yargs.argv.sort,
        direction: yargs.argv.direction,
    },
    headers: {
        'User-Agent': 'Request-Promise',
    },
    json: true,
};

request(options)
    .then((data) => {
        data.forEach(printRepository);
    })
    .catch(error => console.log('error'));