import mongoose from "mongoose"
 
export const DbConnection = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL)
        console.log("mongodb is connected")
    } catch (error) {
        console.log(error)
    }
}