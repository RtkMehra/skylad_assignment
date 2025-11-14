import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DocumentTagDocument = DocumentTag & Document;

@Schema()
export class DocumentTag {
  @Prop({ required: true, type: String, ref: 'Document' })
  documentId: string;

  @Prop({ required: true, type: String, ref: 'Tag' })
  tagId: string;

  @Prop({ required: true, default: false })
  isPrimary: boolean;
}

export const DocumentTagSchema = SchemaFactory.createForClass(DocumentTag);
DocumentTagSchema.index({ documentId: 1, tagId: 1 }, { unique: true });
// Ensure each document has at most one primary tag
DocumentTagSchema.index(
  { documentId: 1, isPrimary: 1 },
  {
    unique: true,
    partialFilterExpression: { isPrimary: true },
  },
);

