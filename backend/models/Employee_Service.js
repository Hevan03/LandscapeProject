import { Schema, model } from 'mongoose';

const Employee_ServiceSchema = new Schema({
    Service_Num: { type: Number, required: true, unique: true },
    Employee_Name: { type: String, required: true },
    Employee_Status: { type: String, enum: ['Open', 'Approve'], required: true },
    Employee_Type: { type: String, required: true, enum: ["Landscaper", "General Employee", "Driver"] },
    Employee_Contact_Num: { type: String, required: true },
    Employee_Email: { type: String, required: true },
    Employee_Adress: { type: String, required: true },
    Created_By: { type: String, required: true },
    Created_Dtm: { type: Date, required: true },
    Avilability: { type: String, required: true, enum: ["Full-time", "Part-time", "Contract"] },
    Approve_Reason: { type: String, required: null },
    Approve_By: { type: String, required: null },
    Approve_Dtm: { type: Date, required: null },
    License_Num: { type: String, required: function () { return this.Employee_Type === "Driver"; } },

    // New field for CV
    Employee_CV: { type: String },
    
    // New field for auto-generated password
    Employee_Password: { type: String, required: null }
}, {
    collection: 'Employee_Service',
});

const Employee_Service = model('Employee_Service', Employee_ServiceSchema);
export default Employee_Service;