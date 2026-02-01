class PubSubService {
  constructor(redis, logger) {
    this.publisher = redis.duplicate();
    this.subscriber = redis.duplicate();
    this.logger = logger;
    this.handlers = new Map();
  }

  async subscriber(channel, handler) {
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, []);
      await this.subscriber.subscribe(channel);
    }
    this.handlers.get(channel).push(handler);
  }
  async unsubscribe(channel, handler) {
    const handlers = this.handlers.get(channel);
    if (!handlers) return;
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
    if (handlers.length === 0) {
      await this.subscriber.unsubscribe(channel);
      this.handlers.delete(channel);
    }
  }

  async publish(channel, data) {
    const payload = JSON.stringify(data);
    await this.publisher.publish(channel, payload);
    this.logger.debug(`Published to ${channel}:`, data);
  }

  listen() {
    this.subscriber.on("message", (channel, message) => {
      const handlers = this.handlers.get(channel);
      if (!handlers) return;

      try {
        const data = JSON.parse(message);
        handlers.forEach((handler) => {
          try {
            handler(data);
          } catch (error) {
            this.logger.error(`Handler error for ${channel}`, error);
          }
        });
      } catch (error) {
        this.logger(`Failed to parse message from ${channel}:`, error);
      }
    });
  }

  async disconnect() {
    await this.subscriber.quit();
    await this.publisher.quit();
  }
}



export default PubSubService;