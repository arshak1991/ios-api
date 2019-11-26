
const JwtStrategy = require('passport-jwt').Strategy,
ExtractJwt = require('passport-jwt').ExtractJwt;
const opts = {}
const User = require('../models/UserModels');

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'SuperSecRetKey';

module.exports = passport => {
    passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
        User.findOne({email: jwt_payload.email}, function(err, user) {
            if (err) {
                return done(err, false);
            }            
            if (user && user.role == 'SUPER_ADMIN' || user.role == 'ADMIN' || user.role == 'USER') {
                return done(null, user);
            } else {
                return done(null, false);
                // or you could create a new account
            }
        });
    }));
}