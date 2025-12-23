// messaging/src/models/DeliveryReceipt.js
export default (sequelize, DataTypes) => {
  const DeliveryReceipt = sequelize.define('DeliveryReceipt', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    messageId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'messages',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('sent', 'delivered', 'read'),
      allowNull: false,
      defaultValue: 'sent'
    },
    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'delivery_receipts',
    timestamps: true,
    updatedAt: true,
    indexes: [
      { 
        fields: ['messageId', 'userId'], 
        unique: true 
      },
      { fields: ['userId', 'status'] },
      { fields: ['messageId'] }
    ]
  });

  DeliveryReceipt.associate = (models) => {
    DeliveryReceipt.belongsTo(models.Message, {
      foreignKey: 'messageId',
      as: 'message'
    });

    DeliveryReceipt.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return DeliveryReceipt;
};