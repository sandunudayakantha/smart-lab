import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, default: ""},
    password: {type: String, default: ""},
    title: {type: String, enum: ["Mr", "Mrs", "Ms", "Baby", "Ven", "Dr"], default: "Mr"},
    address: {type: String, default: ""},
    gender: {type: String, default: "Not Selected"},
    dob: {type: String, default: "Not Selected"},
    phone: {type: String, default: "00000000000"}
})

const userModel = mongoose.models.user || mongoose.model('user', userSchema)

export default userModel 