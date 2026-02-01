class DeliveryService {
  constructor(models, redis, logger) {
    this.models = models;
    this.redis = redis;
    this.logger = logger;
    this.ONLINE_USERS_KEY = "messaging:online_users";
    this.USER_CONNECTIONS_PREFIX = "messaging:connections:";
  }

  async markUserOnline(userId, socketId) {
    const key = `${this.USER_CONNECTIONS_PREFIX}${userId}`;
    await this.redis.sadd(key, socketId);
    await this.redis.sadd(this.ONLINE_USERS_KEY, userId.toString());
    await this.redis.expire(key, 3600); // 1 hour TTL
  }

  async markUserOffline(userId, socketId) {
    const key = `${this.USER_CONNECTIONS_PREFIX}${userId}`;
    await this.redis.srem(key, socketId);

    const connections = await this.redis.smembers(key);
    if (connections.length === 0) {
      await this.redis.srem(this.ONLINE_USERS_KEY, userId.toString());
      await this.redis.del(key);
    }
  }

  async isUserOnline(userId) {
    return (
      (await this.redis.sismember(this.ONLINE_USERS_KEY, userId.toString())) ===
      1
    );
  }

  async getUserConnections(userId) {
    const key = `${this.USER_CONNECTIONS_PREFIX}${userId}`;
    return await this.redis.smembers(key);
  }

  async recordDelivery(messageId, userId, status = "sent") {
    const timestamp = new Date();
    const updateData = { status };

    if (status === "delivered") {
      updateData.deliveredAt = timestamp;
    } else if (status === "read") {
      updateData.deliveredAt = timestamp;
      updateData.readAt = timestamp;
    }

    await this.models.DeliveryReceipt.upsert({
      messageId,
      userId,
      ...updateData,
    });

    this.logger.debug(
      `Recorded ${status} for message ${messageId} to user ${userId}`,
    );
  }

  async getMessageDeliveryStatus(messageId) {
    const receipts = await this.models.DeliveryReceipt.findAll({
      where: { messageId },
      include: [
        {
          model: this.models.User,
          as: "user",
          attributes: ["id", "username", "email"],
        },
      ],
    });

    return receipts.map((r) => ({
      userId: r.userId,
      user: r.user,
      status: r.status,
      deliveredAt: r.deliveredAt,
      readAt: r.readAt,
    }));
  }

  async getUnreadCount(userId) {
    const cacheKey = `unread_count:${userId}`;
    const cached = await this.redis.get(cacheKey);

    if (cached !== null) {
      return parseInt(cached, 10);
    }

    const count = await this.models.DeliveryReceipt.count({
      where: {
        userId,
        status: ["sent", "delivered"],
      },
    });

    await this.redis.setex(cacheKey, 300, count.toString()); // 5 min cache
    return count;
  }

  async invalidateUnreadCache(userId) {
    await this.redis.del(`unread_count:${userId}`);
  }
}

export default DeliveryService;
