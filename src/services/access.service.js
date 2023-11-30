"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const KeyTokenService = require("./keyToken.service");
const RoleShop = require("../auth/constant");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { BadRequestError, MethodNotAllowedError } = require("../core/error.response");




class AccessService {
  static signUp = async ({ name, email, password }) => {
    // a // -> test error 500
    
    // step1: check email exist
    const hodelShop = await shopModel.findOne({ email }).lean(); //lean make query faster, less size , return object javascript 
    if (hodelShop) {
        throw new BadRequestError('Error: Shop already registered')
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [RoleShop.SHOP],
    });
    // step2: if newShop created successful refresh token
    if (newShop) {

      // created privateKey, publicKey lv0

      const cryptoKey = crypto.randomBytes(64).toString('hex');

      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        cryptoKey,
      });

      
      if (!keyStore) {
        throw new BadRequestError('Error: keyStore error')
      }


      // created token pair
      const tokens = await createTokenPair({userId: newShop._id, email }, cryptoKey);
      //console.log(`Created Token Success::`, tokens);

      return {
        metadata: {
          shop: getInfoData({ fileds: ['_id', 'name', 'email'], object: newShop}),
          tokens,
        },
      };
    }

    return {
      metadata: null,
    };
  } 
};


module.exports = AccessService;
