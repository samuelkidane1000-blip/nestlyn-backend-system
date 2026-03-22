export function calculateQuote(payload){
  const rateMap={regular:16.95,oneoff:19,deep:23};
  const rate=rateMap[payload.service_type]??19;
  const rooms=payload.rooms||{};
  const minutes=(rooms.bedroom||0)*25+(rooms.bathroom||0)*35+(rooms.kitchen||0)*45+(rooms.living||0)*30;
  const estimatedHours=Math.max(2,minutes/60);
  let addons=0;
  if(payload.addons?.oven)addons+=25;
  if(payload.addons?.tools)addons+=15;
  if(payload.addons?.laundry)addons+=12;
  return {rate,estimated_hours:Number(estimatedHours.toFixed(2)),amount_gbp:Number((estimatedHours*rate+addons).toFixed(2))};
}
