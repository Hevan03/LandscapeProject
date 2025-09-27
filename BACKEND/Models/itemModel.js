import mongoose from "mongoose";

//create a schema for the item
const itemSchema = new mongoose.Schema({

    itemname:{
        type:String,//data type
        required:true,
        minlength: [3, "Item name must be at least 3 characters long"],
        trim: true
    },
    category:{
        type:String,
        required:true,
    },
    
    price:{
        type:Number,
        required:true,
        min: [0, "Price cannot be negative"]
    },
    quantity:{
        type:Number,
        required:true,
        min: [0, "Quantity cannot be negative"]
    },
    
    description: {
        type : String,
    },

    imageUrl:{
        type:String,
    },
   
},
{ timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Add a virtual property for stock status
itemSchema.virtual("stockStatus").get(function () {
    return this.quantity <= 10 ? "Low Stock" : "In Stock";
});

//model based off of the schema
const Item = mongoose.model("Item", itemSchema);

//export the model so it can be used in other files
export default Item;
