// messaging/tests/mocks/RedisMock.js
const RedisMock = require('ioredis-mock');

class TestRedisClient extends RedisMock {
  constructor() {
    super();
    this.publishedMessages = [];
  }

  async publish(channel, message) {
    this.publishedMessages.push({ channel, message });
    return super.publish(channel, message);
  }

  getPublishedMessages(channel) {
    return this.publishedMessages
      .filter(m => m.channel === channel)
      .map(m => JSON.parse(m.message));
  }

  clearPublishedMessages() {
    this.publishedMessages = [];
  }

  duplicate() {
    return new TestRedisClient();
  }
}

module.exports = TestRedisClient;