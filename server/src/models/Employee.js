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
    guessToday: { type: Boolean, default: false },
    memoryToday: { type: Boolean, default: false },
    tasks: [{ type: String }],
    history: [{
      id: String,
      at: Number,
      label: String,
      delta: Number,
    }],
  },
  discountCodes: [{
    id: { type: String, required: true },
    code: { type: String, required: true },
    label: { type: String, required: true },
    providerSlug: { type: String, default: null },
    category: { type: String, default: null },
    discountPct: { type: Number, required: true },
    source: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
  }],
}, { timestamps: true })

EmployeeSchema.methods.toJSON = function () {
  const o = this.toObject()
  o.id = String(o._id); delete o._id; delete o.__v
  o.userId = String(o.userId)
  return o
}

export default mongoose.model('Employee', EmployeeSchema)
