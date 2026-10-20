// Recognition receives horizontally mirrored pixels; compensate once at the camera boundary.
// UI labels and command routing must both consume this corrected result.
export function physicalHandedness(prediction,mirroredInput=true){
 if(!prediction)return null;
 if(!mirroredInput)return {...prediction};
 const opposite={Left:'Right',Right:'Left'};
 return {...prediction,categoryName:opposite[prediction.categoryName]||prediction.categoryName};
}
