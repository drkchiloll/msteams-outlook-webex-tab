import * as mongoose from 'mongoose';

let { Schema } = mongoose;

export interface IGen extends mongoose.Document {
  _id:string;
  name:string;
  description?:string;
}

let GenericSchema = new Schema({
  _id:String,
  name: {
    type:String,
    required:true
  },
  description:String,
});

GenericSchema.virtual('id').get(function() {
  return this._id;
});
GenericSchema.virtual('id').set(function(id:String) {
  this._id = id;
});
GenericSchema.set('toJSON', {virtuals: true});

export const NetworkDevice = mongoose.model<IGen>(
  'Generic',
  GenericSchema,
  'genericApi'
);
