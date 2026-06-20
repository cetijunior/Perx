import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['employee', 'admin'], required: true },
  company: { type: String, default: 'PERX' },
  department: { type: String, default: '' },
  budget: { type: Number, default: 30000 },
}, { timestamps: true })

UserSchema.methods.toJSON = function () {
  const o = this.toObject()
  delete o.passwordHash
  o.id = String(o._id); delete o._id; delete o.__v
  return o
}

export default mongoose.model('User', UserSchema)
