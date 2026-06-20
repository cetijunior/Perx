import mongoose from 'mongoose'

const RedemptionSchema = new mongoose.Schema({
  jti: { type: String, required: true, unique: true, index: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  providerSlug: { type: String, required: true },
  redeemedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

RedemptionSchema.methods.toJSON = function () {
  const o = this.toObject()
  o.id = String(o._id); delete o._id; delete o.__v
  o.employeeId = String(o.employeeId)
  o.userId = String(o.userId)
  o.redeemedBy = String(o.redeemedBy)
  return o
}

export default mongoose.model('Redemption', RedemptionSchema)
