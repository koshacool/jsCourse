const request = require('request-promise');
var argv = require('yargs').argv;
const ACCESS_TOKEN = 'cec27646c4560b0ef35d3d703b5a922d9cb32c27';
let queryParams = {
  access_token: ACCESS_TOKEN,
  username: 'koshacool',
  sort: 'full_name',
};
const REQUEST_URL = 'https://api.github.com/users/' + queryParams.username +'/repos';




const printRepository = repository => console.log(repository.full_name);


let createKeys = (argv) => {
  let nodeArguments = [
    {
      params: ['u', 'username'],
      queryParamsName: 'username',
      description: 'Set username for url request query!',
      action: (param) => queryParams.username = param,
    },
    {
      params: ['s', 'sort'],
      queryParamsName: 'sort',
      description: 'Set params for sort url request query!',
      action: (param) => queryParams.sort = param,
    },
    {
      params: ['d', 'direction'],
      queryParamsName: 'direction',
      description: 'Set direction for sort url request query!',
      action: (param) => queryParams.direction = param,
    },
    {
      params: ['h', 'help'],
      description: 'Show information about keys for node!',
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
    let keys = item.params;
    let countParams = keys.reduce((sum, current) => {
      if (argv[current]) {
        sum++;
      }
      return sum;
    }, 0); //Count getted the same keys for url query param

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
    //console.log(queryParams);
    //console.log(countParams);

  });
  //console.log('(%s,%s)', argv.u, argv.username);
  //console.log(argv);
};

createKeys(argv);
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
  .catch(error => console.log(error));


