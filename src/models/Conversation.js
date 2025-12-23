// messaging/src/models/Conversation.js
export default (sequelize, DataTypes) => {
  const Conversation = sequelize.define(
    "Conversation",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      type: {
        type: DataTypes.ENUM("direct", "group"),
        allowNull: false,
        defaultValue: "direct",
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          notEmpty: true, // if present, must not be empty
        },
      },
      metadata: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      lastMessageAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
      },
    },
    {
      tableName: "conversations",
      timestamps: true,
      paranoid: true, // ← soft-delete enabled
      indexes: [
        { name: "idx_conversation_type", fields: ["type"] },
        { name: "idx_conversation_lastMessageAt", fields: ["lastMessageAt"] },
        { name: "idx_conversation_createdBy", fields: ["createdBy"] },
      ],
      validate: {
        nameOnlyForGroup() {
          if (this.type === "direct" && this.name) {
            throw new Error("Direct conversations must not have a name");
          }
        },
      },
    }
  );
  Conversation.associate = (models) => {
    Conversation.belongsToMany(models.User, {
      through: "ConversationParticipants",
      as: "participants",
      foreignKey: "conversationId",
    });

    Conversation.hasMany(models.Message, {
      foreignKey: "conversationId",
      as: "messages",
      onDelete: "CASCADE",
    });

    Conversation.belongsTo(models.User, {
      foreignKey: "createdBy",
      as: "creator",
    });
  };

  return Conversation;
};
