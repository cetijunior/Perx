import mongoose from 'mongoose'

const EmployeeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  activeBenefits: [{ type: String }],
  cart: [{ type: String }],
  bonus: { type: Number, default: 0 },
  preferences: {
    categories: [{ type: String }],
    notes: { type: String, default: '' },
  },
  games: {
    streak: { type: Number, default: 0 },
    spinsLeft: { type: Number, default: 1 },
    scratchToday: { type: Boolean, default: false },
    tasks: [{ type: String }],
  },
}, { timestamps: true })

EmployeeSchema.methods.toJSON = function () {
  const o = this.toObject()
  o.id = String(o._id); delete o._id; delete o.__v
  o.userId = String(o.userId)
  return o
}

export default mongoose.model('Employee', EmployeeSchema)
