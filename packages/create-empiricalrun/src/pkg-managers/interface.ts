export interface PackageManager {
  name: string;
  init: () => Promise<void>;
  install: () => Promise<void>;
  installDependency: (pkg: string) => Promise<void>;
  installDevDependency: (pkg: string) => Promise<void>;
}

export interface PackageManagerConstructor {
  new (): PackageManager;
  check(userAgent: string): boolean;
}
