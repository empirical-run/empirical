import { Model, ModelTypes } from "@empiricalrun/types";
import { map } from "./openai";

export function getProvider(model: Model) {
  if (typeof model === "string") {
    const [providerName, modelName] = model.split(":");
    const completionFunction = map.get(ModelTypes.CHAT);
    return {
      modelName,
      completionFunction,
      providerName,
    };
  }
}
