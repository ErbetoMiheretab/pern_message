// messaging/src/models/Message.js
export default (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    conversationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'conversations',
        key: 'id'
      }
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    contentType: {
      type: DataTypes.ENUM('text', 'image', 'file', 'system'),
      defaultValue: 'text'
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    editedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'messages',
    timestamps: true,
    paranoid: true,
    indexes: [
      { fields: ['conversationId', 'createdAt'] },
      { fields: ['senderId'] },
      { fields: ['contentType'] }
    ]
  });

  Message.associate = (models) => {
    Message.belongsTo(models.Conversation, {
      foreignKey: 'conversationId',
      as: 'conversation'
    });

    Message.belongsTo(models.User, {
      foreignKey: 'senderId',
      as: 'sender'
    });

    Message.hasMany(models.DeliveryReceipt, {
      foreignKey: 'messageId',
      as: 'receipts'
    });
  };

  return Message;
};