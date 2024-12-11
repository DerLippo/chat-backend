import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const roomSchema = new Schema({
  name: {
    type: String,
    required: true,
    default: 'Chat',
  },
  members: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
    default: [],
  },
  disabled: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const Room = model('Room', roomSchema);
export default Room;
