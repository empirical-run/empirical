import { Generator } from "../interface";
export class TSGenerator implements Generator {
  format = "ts";

  async generate() {
    // generate json file
    console.log("generate ts files");
  }
}
