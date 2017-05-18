import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
    //Provide access to logged user data
    Meteor.publish('userData', function () {
        return Meteor.users.find({}, {
            fields: {
                username: 1,
                'services.google.email': 1,
                'services.google.picture': 1,
                'services.github': 1,
            }
        });
    });

    //Settings for google auth
    ServiceConfiguration.configurations.remove({service: 'google'});
    ServiceConfiguration.configurations.insert({
        service: 'google',
        clientId: '403253438904-qj33b32v4rd6vrofdtrtkjb87bit50tk.apps.googleusercontent.com',
        secret: 'eOsoxL7qvTwIcRrprP6043y1'
    });

    //Settings for github auth
    ServiceConfiguration.configurations.remove({service: 'github'});
    ServiceConfiguration.configurations.insert({
        service: 'github',
        clientId: 'c73c4ac7eb31fb396531',
        secret: '29c505de221c162f0f4044cf1bd570a19a0049e2'
    });





});
