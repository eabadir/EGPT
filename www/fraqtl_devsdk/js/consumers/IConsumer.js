/**
 * IConsumer - Interface for simulation data consumers.
 *
 * Consumers render or process TickData and largeObjects from the EGPT engine.
 * Implement this interface to create custom renderers (WebGL, headless logger, etc.).
 *
 * Interface (documented, not enforced):
 *
 *   consume(tickData, largeObjects): void
 *
 *   - tickData: TickData from universe.doTick() (frameData, universeData, dimensionData)
 *   - largeObjects: Array of LargeObject instances (rect, color, visible, alpha)
 *
 * Example usage:
 *   const tickData = universe.doTick();
 *   myConsumer.consume(tickData, universe.largeObjects);
 */
