import { promises as fs } from "fs";

const cachePath = ".empiricalrun";
const fileName = "user.json";

type UserData = {
  id: string;
};

export class LocalUserStore {
  async createIdentity(): Promise<UserData> {
    const userData: UserData = { id: crypto.randomUUID() };
    const cwd = process.cwd();
    const storePath = `${cwd}/${cachePath}/${fileName}`;
    await fs.mkdir(`${cwd}/${cachePath}`, { recursive: true });
    await fs.writeFile(storePath, JSON.stringify(userData));
    return userData;
  }

  async getOrCreateIdentity(): Promise<UserData> {
    const cwd = process.cwd();
    const storePath = `${cwd}/${cachePath}/${fileName}`;
    try {
      const data = (await fs.readFile(storePath)).toString();
      return JSON.parse(data);
    } catch (err) {
      return await this.createIdentity();
    }
  }
}
