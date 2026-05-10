import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
class CommentUser {

  @Prop({ type: String, required: true })
  username: string;

  @Prop({ type: String, required: true })
  fullName: string;
}

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {

  @Prop({ type: String, required: true })
  body: string;

  @Prop({ type: Number, required: true, index: true })
  postId: number;

  @Prop({ type: Number, default: 0 })
  likes: number;

  @Prop({ type: CommentUser, required: true })
  user: CommentUser;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
