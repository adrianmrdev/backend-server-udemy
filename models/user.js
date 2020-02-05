var mongoose=require("mongoose");
var uniqueValidator=require("mongoose-unique-validator");

var Schema = mongoose.Schema;

var validRoles = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} is not a valid role'
}

var userSchema = new Schema({

    name: { type: String, required: [true, "User name is required"] },
    email: { type: String, unique: true, required: [true, "User email is required"]},
    password: { type: String, required: [true, "User password is required"]},
    img: { type: String },
    role: { type: String, required: [true, "User role is required"], default: "USER_ROLE", enum: validRoles}

});

userSchema.plugin( uniqueValidator, { message: "{PATH} should be unique"} );

module.exports = mongoose.model('User', userSchema);