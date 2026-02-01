class MessageRepository {
  constructor(models) {
    this.models = models;
  }

  async create(data) {
    return await this.models.Message.create(data);
  }

  async findById(id, options = {}) {
    return await this.models.Message.findByPk(id, {
      include: options.include || [],
      ...options,
    });
  }

  async findByConversation(conversationId, options = {}) {
    const { limit = 50, offset = 0, before = null, after = null } = options;

    const where = { conversationId };

    if (before) {
      where.createdAt = { [this.models.Sequelize.Op.lt]: before };
    }
    if (after) {
      where.createdAt = { [this.models.Sequelize.Op.gt]: after };
    }

    return await this.models.Message.findAll({
      where,
      include: [
        {
          model: this.models.User,
          as: "sender",
          attributes: ["id", "username", "email", "avatar"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });
  }

  async update(id, data) {
    const message = await this.findById(id);
    if (!message) return null;

    return await message.update(data);
  }

  async softDelete(id) {
    const message = await this.findById(id);
    if (!message) return null;

    return await message.destroy();
  }

  async getUnreadMessages(userId) {
    return await this.models.Message.findAll({
      include: [
        {
          model: this.models.DeliveryReceipt,
          as: "receipts",
          where: {
            userId,
            status: {
              [this.models.Sequelize.Op.in]: ["sent", "delivered"],
            },
          },
          required: true,
        },
      ],
    });
  }
}

export default MessageRepository;
