"use strict";

const AccessService = require("../services/access.service");
const { OKResponse, CREATEDResponse } = require("../core/success.response");

class AccessController {

  signUp = async (req, res, next) => {
    new CREATEDResponse ({
      message: 'Registered OK!',
      metadata: await AccessService.signUp(req.body),
      options: {
        limit: 10
      }
    }).send(res);
  }
}

module.exports = new AccessController();
