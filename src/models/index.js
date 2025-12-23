// messaging/src/models/index.js
import { readdirSync } from 'fs';
import { basename as _basename, join } from 'path';

export default (sequelize) => {
  const models = {};
  const basename = _basename(__filename);

  readdirSync(__dirname)
    .filter(file => {
      return (
        file.indexOf('.') !== 0 &&
        file !== basename &&
        file.slice(-3) === '.js'
      );
    })
    .forEach(file => {
      const model = require(join(__dirname, file))(
        sequelize,
        sequelize.Sequelize.DataTypes
      );
      models[model.name] = model;
    });

  Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
      models[modelName].associate(models);
    }
  });

  models.sequelize = sequelize;
  models.Sequelize = sequelize.Sequelize;

  return models;
};