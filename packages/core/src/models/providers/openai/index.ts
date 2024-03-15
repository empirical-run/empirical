import { ModelTypes } from "@empiricalrun/types";
import { completion as chatCompletion } from "./chat";

export const map = new Map<ModelTypes, Function>([
  [ModelTypes.CHAT, chatCompletion],
]);
