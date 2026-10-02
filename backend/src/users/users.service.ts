import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema.js';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly users: Model<User>) {}
  findByEmail(email: string) {
    return this.users.findOne({ email: email.toLowerCase() }).exec();
  }
  findByFirebaseUid(firebaseUid: string) {
    return this.users.findOne({ firebaseUid }).exec();
  }
  findById(id: string) {
    return this.users.findById(id).exec();
  }
  createFirebaseUser(name: string, email: string, firebaseUid: string) {
    return this.users.create({ name, email: email.toLowerCase(), firebaseUid });
  }
}
