const Setting = require("../../models/settings-general.model");

module.exports.setting = async (req, res, next) => {
  const setting = await Setting.findOne({});

  res.locals.setting = setting;
  
  next();
}