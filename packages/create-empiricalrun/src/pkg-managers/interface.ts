export interface PackageManager {
  name: string;
}

export interface PackageManagerConstructor {
  new (): PackageManager;
  check(userAgent: string): boolean;
}
