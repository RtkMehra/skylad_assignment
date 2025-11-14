import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TagDocument = Tag & Document;

@Schema({ timestamps: true })
export class Tag {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: String, ref: 'User' })
  ownerId: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const TagSchema = SchemaFactory.createForClass(Tag);
TagSchema.index({ ownerId: 1, name: 1 }, { unique: true });

