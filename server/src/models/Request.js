import mongoose from 'mongoose'

const RequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [{ type: String, required: true }],
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  decidedAt: { type: Date },
}, { timestamps: true })

RequestSchema.methods.toJSON = function () {
  const o = this.toObject()
  o.id = String(o._id); delete o._id; delete o.__v
  o.userId = String(o.userId)
  return o
}

export default mongoose.model('Request', RequestSchema)
