export { computeCPM }                    from "./cpm";
export { computeJohnson, wouldCycle }    from "./johnson";
export { computeHungarian }              from "./hungarian";

// ¡Nuevas exportaciones actualizadas!
export { 
  ALGO_FAMILIES, 
  getFamily, 
  getVariant, 
  getAlgoColor 
} from "./registry";

export type { 
  AlgoFamily, 
  AlgoVariant 
} from "./registry";

export type { HungarianOutput, HungarianResult, HungarianError } from "./hungarian";