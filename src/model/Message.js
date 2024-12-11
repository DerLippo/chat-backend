import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const messageSchema = new Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    contents: [
      {
        type: {
          type: String,
          enum: ['text', 'image', 'audio', 'file'],
          required: true,
        },
        content: { type: String, required: true },
      },
    ],
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    editedAt: {
      type: Date,
    },
    editedBy: {
      type: String,
    },
    deletedAt: {
      type: Date,
    },
    deletedBy: {
      type: String,
    },
  },
  { versionKey: false }
);

const Message = model('Message', messageSchema);

export default Message;
