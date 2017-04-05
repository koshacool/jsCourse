const request = require('request-promise');
const argv = require('yargs').argv;
const ACCESS_TOKEN = 'f94bb26a9dfdf05d800d3083557ac4ac55c1f99a';
const printRepository = repository => console.log(repository.full_name);

const createKeys = (argv) => {
    let queryParams = {
        access_token: ACCESS_TOKEN,
        username: 'koshacool',
        sort: 'full_name',
    };//Default params for query

    let nodeArguments = [
        {
            params: ['u', 'username'],
            queryParamsName: 'username',
            description: 'Set username for url request query!',
            action: (param) => queryParams.username = param,//Function for set parameter in queryParams
        },
        {
            params: ['s', 'sort'],
            queryParamsName: 'sort',
            description: 'Set params for sort url request query!',
            action: (param) => queryParams.sort = param,//Function for set parameter in queryParams
        },
        {
            params: ['d', 'direction'],
            queryParamsName: 'direction',
            description: 'Set direction for sort url request query!',
            action: (param) => queryParams.direction = param,//Function for set parameter in queryParams
        },
        {
            params: ['h', 'help'],
            description: 'Show information about keys for node!',

            //Function for display information about all keys or one key
            action: (param) => {
                nodeArguments.map((item) => {
                    item.params.forEach((queryParam) => {
                        let hyphen = queryParam.length > 1 ? '--' : '-';
                        if (typeof param == 'boolean') {
                            console.log(hyphen + queryParam + ' - ' + item.description);
                        } else {
                            if (queryParam == param) {
                                console.log(hyphen + queryParam + ' - ' + item.description);
                            }
                        }
                    });
                });
            },
        },
    ];

    nodeArguments.forEach((item) => {
        let keys = item.params;//Params name

        //Count getted the same keys for url query param
        let countParams = keys.reduce((sum, current) => {
            if (argv[current]) {
                sum++;
            }
            return sum;
        }, 0);

        //If getted more then 1 key for url query param - show ERROR
        if (countParams > 1) {
            let error = 'You must to pass only one parametr of these: ' +
                keys.reduce(((sum, current) => sum + current + ', '), '');
            throw new Error(error);
        }

        //When we get only 1 key, call action for this param
        if (countParams) {
            keys.forEach((key) => {
                if (argv[key]) {
                    item.action(argv[key]);
                }
            })
        }
    });

    return queryParams;
};

const queryParams = createKeys(argv);//Create object with params for query
const REQUEST_URL = 'https://api.github.com/users/' + queryParams.username + '/repos';

const options = {
    uri: REQUEST_URL,

    qs: queryParams,

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
