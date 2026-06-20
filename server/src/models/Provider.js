import mongoose from 'mongoose'

const ProviderSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  cost: { type: Number, required: true },
  cadence: { type: String, default: 'month' },
  rating: { type: Number, default: 4.5 },
  blurb: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  posterUrl: { type: String, default: '' },
  accentColor: { type: String, default: '' },
  map: {
    x: { type: Number, default: 50 },
    y: { type: Number, default: 50 },
  },
}, { timestamps: true })

ProviderSchema.methods.toJSON = function () {
  const o = this.toObject()
  o.id = String(o._id); delete o._id; delete o.__v
  return o
}

export default mongoose.model('Provider', ProviderSchema)
