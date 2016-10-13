module.exports = function(sequelize, DataTypes) {
  var Key = sequelize.define("Key", {
    key: DataTypes.STRING,
    owner: DataTypes.STRING
  });
  return Key;
};
