const passport = require('passport')
const Strategy = requiere('passport-local').Strategy;

passport.use('local.sigup', new LocalStrategy({
    usernameField:'user',
    passwordField: 'password',
    passReqToCallback:true
},async(req,user,password,done)=>{
    console.log(req.body);
}
));