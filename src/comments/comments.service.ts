import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './entities/comment.entity';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) { }

  async create(createCommentDto: CreateCommentDto): Promise<CommentDocument> {
    const lastComment = await this.commentModel.findOne().sort({ id: -1 }).exec();
    const nextId = lastComment ? lastComment.id + 1 : 1;

    const newComment = new this.commentModel({
      id: nextId,
      ...createCommentDto,
    });
    return newComment.save();
  }

  async findAll(postId?: number): Promise<CommentDocument[]> {
    const query = postId ? { postId } : {};
    return this.commentModel.find(query).exec();
  }

  async findOne(id: number): Promise<CommentDocument> {
    const comment = await this.commentModel.findOne({ id }).exec();
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    return comment;
  }

  async update(id: number, updateCommentDto: UpdateCommentDto): Promise<CommentDocument> {
    const updatedComment = await this.commentModel
      .findOneAndUpdate({ id }, updateCommentDto, { new: true })
      .exec();
    if (!updatedComment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    return updatedComment;
  }

  async remove(id: number): Promise<void> {
    const result = await this.commentModel.deleteOne({ id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
  }
  async updatemany() {
    console.log('updatemany');
    try {
      await this.commentModel.collection.dropIndex('id_1');
      console.log('Index dropped');
    } catch (e) {
      console.log('Index drop ignored (might not exist):', e.message);
    }


    await this.commentModel.updateMany(
      {},
      { $unset: { id: "" } },
      { strict: false },
    );
  }
}
