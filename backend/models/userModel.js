import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, default: "", index: false},
    password: {type: String, default: ""},
    title: {type: String, enum: ["Mr", "Mrs", "Ms", "Baby", "Ven", "Dr"], default: "Mr"},
    address: {type: String, default: ""},
    gender: {type: String, default: "Not Selected"},
    dob: {type: String, default: "Not Selected"},
    age: {
        years: {type: Number, default: 0},
        months: {type: Number, default: 0}
    },
    phone: {type: String, default: "00000000000"}
}, {
    autoIndex: false
});

userSchema.index({ email: 1 }, { unique: false });

const userModel = mongoose.models.user || mongoose.model('user', userSchema)

export default userModel 