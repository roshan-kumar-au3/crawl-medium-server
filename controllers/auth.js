const Admin = require('../models/admin');
const { validationResult } = require('express-validator');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
const bcrypt = require("bcryptjs");
const { secretOrKey } = require('../config/key');


const signup = (req, res) => {
    console.log(req.body);

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array()[0].msg
        })
    }

    Admin.findOne({
        where: {
          email: req.body.email
        }
      }).then(admin => {
        if (admin) {
            return res.status(400).json({
                error: "Email already exists"
            });
        } else {
          const newAdmin = new Admin({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
          });
          bcrypt.genSalt(12, (err, salt) => {
            if (err) throw err;
            bcrypt.hash(newAdmin.password, salt, (err, hash) => {
              newAdmin.password = hash;
              newAdmin
                .save()
                .then(admin => res.status(200).json(admin))
                .catch(err => console.log(err));
            });
          });
        }
      });
};

const signin = (req, res) => {
    console.log(req.body);
    const { email, password } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array()[0].msg
        })
    }

    Admin.findOne({
        where: {
          email
        }
      })
        .then(admin => {
          if (!admin) {
            errors.email = "No admin registred with this email";
            return res.status(404).json({
                error: "No admin registred with this email"
            });
          }
          bcrypt.compare(password, admin.password).then(isMatch => {
            if (isMatch) {
              // sign jwt token
              // create Token
                const token = jwt.sign({id: admin.id}, secretOrKey);
                // put this token into admin cookies
                res.cookie("token", token, {
                    expires: new Date(Date.now() + 900000)
                })
                return res.json({ token, admin: { id : admin.id, name: admin.name, email: admin.email } })
            } else {
              errors.password = "Incorrect Password";
              return res.status(400).json({
                error: "Incorrect Password"
              });
            }
          });
        })
        .catch(err => console.log(err));
};

const signout = (req, res) => {
    res.clearCookie("token");
    res.json({
        message: "admin Signout successfully"
    });
};

//Protected Routes checking token using express-jwt
const isSignedIn = expressJwt({
    secret: secretOrKey,
    userProperty: "auth",
    algorithms: ['HS256']
});

//Custom Middleware
const isAuthenticated = (req, res, next) => {
  // console.log('profile', req.profile);
  // console.log('auth', req.auth);

    let checker = req.profile && req.auth && req.profile.id == req.auth.id;
    if(!checker) {
        return res.status(403).json({
            error: "ACCESS DENIED"
        })
    }
    next();
}


module.exports = { signout, signup, signin, isSignedIn, isAuthenticated }