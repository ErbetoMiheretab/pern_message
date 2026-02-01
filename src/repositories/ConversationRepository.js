class ConversationRepository {
  constructor(models) {
    this.models = models;
  }

  async create(data, participantIds) {
    const transaction = await this.models.sequelize.transaction();

    try {
      const conversation = await this.models.Conversation.create(data, {
        transaction
      });

      await conversation.setParticipants(participantIds, { transaction });

      await transaction.commit();
      return await this.findById(conversation.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async findById(id) {
    return await this.models.Conversation.findByPk(id, {
      include: [
        {
          model: this.models.User,
          as: 'participants',
          attributes: ['id', 'username', 'email', 'avatar'],
          through: { attributes: ['role', 'joinedAt'] }
        }
      ]
    });
  }

  async findByParticipants(participantIds) {
    if (participantIds.length !== 2) {
      throw new Error('Direct conversations must have exactly 2 participants');
    }

    const conversations = await this.models.Conversation.findAll({
      where: { type: 'direct' },
      include: [
        {
          model: this.models.User,
          as: 'participants',
          attributes: ['id'],
          through: { attributes: [] }
        }
      ]
    });

    return conversations.find(conv => {
      const ids = conv.participants.map(p => p.id).sort();
      const searchIds = [...participantIds].sort();
      return JSON.stringify(ids) === JSON.stringify(searchIds);
    });
  }

  async findByUser(userId, options = {}) {
    const { limit = 20, offset = 0 } = options;

    return await this.models.Conversation.findAll({
      include: [
        {
          model: this.models.User,
          as: 'participants',
          where: { id: userId },
          attributes: [],
          through: { attributes: [] }
        },
        {
          model: this.models.User,
          as: 'participants',
          attributes: ['id', 'username', 'email', 'avatar'],
          through: { attributes: ['role'] }
        }
      ],
      order: [['lastMessageAt', 'DESC NULLS LAST']],
      limit,
      offset
    });
  }

  async addParticipant(conversationId, userId, role = 'member') {
    const conversation = await this.findById(conversationId);
    if (!conversation) return null;

    await conversation.addParticipant(userId, {
      through: { role, joinedAt: new Date() }
    });

    return await this.findById(conversationId);
  }

  async removeParticipant(conversationId, userId) {
    const conversation = await this.findById(conversationId);
    if (!conversation) return null;

    await conversation.removeParticipant(userId);
    return conversation;
  }

  async isParticipant(conversationId, userId) {
    const count = await this.models.sequelize.models.ConversationParticipants.count({
      where: {
        conversationId,
        userId,
        leftAt: null
      }
    });

    return count > 0;
  }

  async updateLastMessage(conversationId) {
    await this.models.Conversation.update(
      { lastMessageAt: new Date() },
      { where: { id: conversationId } }
    );
  }
}

export default ConversationRepository;