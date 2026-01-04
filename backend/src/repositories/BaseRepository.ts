import { Model, ModelCtor, WhereOptions, CreateOptions, UpdateOptions, DestroyOptions, FindOptions } from 'sequelize';
import logger from '../utils/logger';

export abstract class BaseRepository<T extends Model> {
  protected model: ModelCtor<T>;

  constructor(model: ModelCtor<T>) {
    this.model = model;
  }

  /**
   * Find a record by ID
   */
  async findById(id: string): Promise<T | null> {
    try {
      return await this.model.findByPk(id);
    } catch (error) {
      logger.error(`Error finding ${this.model.name} by ID: ${id}`, error);
      throw error;
    }
  }

  /**
   * Find all records with optional filtering
   */
  async findAll(options?: FindOptions): Promise<T[]> {
    try {
      return await this.model.findAll(options);
    } catch (error) {
      logger.error(`Error finding all ${this.model.name}`, error);
      throw error;
    }
  }

  /**
   * Find one record with filtering
   */
  async findOne(options?: FindOptions): Promise<T | null> {
    try {
      return await this.model.findOne(options);
    } catch (error) {
      logger.error(`Error finding one ${this.model.name}`, error);
      throw error;
    }
  }

  /**
   * Find records with pagination
   */
  async findAndCountAll(options: FindOptions): Promise<{ rows: T[]; count: number }> {
    try {
      return await this.model.findAndCountAll(options);
    } catch (error) {
      logger.error(`Error finding and counting ${this.model.name}`, error);
      throw error;
    }
  }

  /**
   * Create a new record
   */
  async create(data: any, options?: CreateOptions): Promise<T> {
    try {
      return await this.model.create(data, options);
    } catch (error) {
      logger.error(`Error creating ${this.model.name}`, error);
      throw error;
    }
  }

  /**
   * Update a record
   */
  async update(data: any, options: UpdateOptions): Promise<[number]> {
    try {
      return await this.model.update(data, options);
    } catch (error) {
      logger.error(`Error updating ${this.model.name}`, error);
      throw error;
    }
  }

  /**
   * Update a record by ID
   */
  async updateById(id: string, data: any): Promise<T | null> {
    try {
      const [affectedCount] = await this.model.update(data, {
        where: { id } as any,
      });

      if (affectedCount === 0) {
        return null;
      }

      return await this.findById(id);
    } catch (error) {
      logger.error(`Error updating ${this.model.name} by ID: ${id}`, error);
      throw error;
    }
  }

  /**
   * Delete records
   */
  async delete(options: DestroyOptions): Promise<number> {
    try {
      return await this.model.destroy(options);
    } catch (error) {
      logger.error(`Error deleting ${this.model.name}`, error);
      throw error;
    }
  }

  /**
   * Delete a record by ID
   */
  async deleteById(id: string): Promise<boolean> {
    try {
      const affectedCount = await this.model.destroy({
        where: { id } as any,
      });

      return affectedCount > 0;
    } catch (error) {
      logger.error(`Error deleting ${this.model.name} by ID: ${id}`, error);
      throw error;
    }
  }

  /**
   * Count records
   */
  async count(options?: FindOptions): Promise<number> {
    try {
      return await this.model.count(options);
    } catch (error) {
      logger.error(`Error counting ${this.model.name}`, error);
      throw error;
    }
  }

  /**
   * Check if a record exists
   */
  async exists(options: FindOptions): Promise<boolean> {
    try {
      const count = await this.model.count(options);
      return count > 0;
    } catch (error) {
      logger.error(`Error checking if ${this.model.name} exists`, error);
      throw error;
    }
  }
}

export default BaseRepository;