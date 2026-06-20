import mongoose from 'mongoose'

let cached = globalThis.__perxMongoose

export async function connectDB() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')

  if (cached?.conn) return cached.conn

  if (!cached) {
    cached = globalThis.__perxMongoose = { conn: null, promise: null }
  }

  if (!cached.promise) {
    mongoose.set('strictQuery', true)
    cached.promise = mongoose.connect(url).then((m) => {
      console.log('mongo connected:', m.connection.name)
      return m
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}
