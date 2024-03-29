const User = require("../model/user");
const { genSaltSync, hashSync, compareSync } = require("bcrypt");
var jwt = require('jsonwebtoken');


module.exports.login = (req, res) => {
  
  const username = req.body.username;
  const password = req.body.password;
  //console.log("Hello from login!",username, password);

  if (username != undefined && password != undefined) {
    User.findOne({
      username: username
    })
      .then((user) => {
        //console.log("> USER: ", user)
        if (!user) {
          res.json({
            status: "Error",
            msg: "username or password is incorrect",
          });
        } else {
          const result = compareSync(password, user.password);
          if (result) {
            //ok! go on
            user.password = undefined; //remove Password
            const token = jwt.sign({ user: user }, "Olivia8289", {
              expiresIn: "24h"
            });
            //console.log(jsontoken);
            return res.status(200).json({
              success: true, // remove this in next iteration
              message: "Authorized",  // remove this in next iteration
              user: user,  // remove this in next iteration
              token: token,  // remove this in next iteration
              status: "success",
              data: {
                user: user,
                token: token,
                message: "Authorized"
              }
            })
          } else {
            //not authorized
            return res.status(401).json({
              success: false, // remove this in next iteration 
              message: "Invalid username or password", // remove this in next iteration
              status: "fail",
              data: { 
                username: "Maybe username is invalid!", 
                password: "Maybe password is invalid!"
              }
            });
          }
        }
      })
      .catch((err) => {
        return res.status(500).json({
          success: false, // remove this in next iteration
          status: "error",
          message: err,
        });
      });
  } else {
    return res.status(500).json({
      success: false,
      message: "username and password are required",
    });
  }
};

module.exports.checkToken = (req, res, next) => {
  let token = req.get("auth");
  if (token) {
    //token = token.slice(7); // remove "bearer "
    jwt.verify(token, "Olivia8289", (err, decoded) => {
      //console.log('---- VERIFY: ',err, decoded);
      if (err) {
        res.status(401).json({
          success: false,
          message: "Invalid Token"
        });
      } else {
        req.userFromJWT = { id: decoded.user.id, _id: decoded.user._id };
        next();
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }
}
