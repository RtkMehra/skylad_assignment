import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongooseDocument } from 'mongoose';

export type DocumentDocument = Document & MongooseDocument;

@Schema({ timestamps: true })
export class Document {
  @Prop({ required: true, type: String, ref: 'User' })
  ownerId: string;

  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  mime: string;

  @Prop({ required: true })
  textContent: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const DocumentSchema = SchemaFactory.createForClass(Document);
DocumentSchema.index({ ownerId: 1, createdAt: -1 });
DocumentSchema.index({ textContent: 'text' });

