const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
    first_name : {type:String, require:true, maxLength:100}, 
    last_name : {type:String, require:true, maxLength:100}, 
    date_of_birth: {type:Date},
    date_of_death: {type:Date},
});

AuthorSchema.virtual("name").get(function (){
    let fullname = "";
    if(this.first_name && this.last_name)
        fullname = this.first_name + " " + this.last_name;

    return fullname;
});

AuthorSchema.virtual("url").get(function (){
    return `catalog/author$(this._id)`;
});


module.exports = mongoose.model("Author", AuthorSchema);

