import mongoose from 'mongoose'

export async function connectDB() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  mongoose.set('strictQuery', true)
  await mongoose.connect(url)
  console.log('mongo connected:', mongoose.connection.name)
}
