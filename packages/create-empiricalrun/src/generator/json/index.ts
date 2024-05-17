import { config } from "../config";
import { Generator } from "../interface";
import fs from "fs/promises";
import { generateGitIgnore } from "../utils";
import { GEN_CONFIG_FILE_NAME } from "../../constant";
export class JSONGenerator implements Generator {
  format = "json";

  async #createJSONConfig(dir: string) {
    const configFileFullPath = `${dir}/${GEN_CONFIG_FILE_NAME}`;
    await fs.writeFile(configFileFullPath, JSON.stringify(config, null, 2));
  }

  async generate() {
    const cwd = process.cwd();
    await this.#createJSONConfig(cwd);
    await generateGitIgnore(cwd);
    console.log(`created ${GEN_CONFIG_FILE_NAME} in ${cwd}`);
  }
}
