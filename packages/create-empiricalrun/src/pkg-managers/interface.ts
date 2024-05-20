export interface PackageManager {
  name: string;
  execCmd: string;
  init: () => void;
  install: () => void;
  installDependency: (pkg: string) => void;
  installDevDependency: (pkg: string) => void;
}

export interface PackageManagerConstructor {
  new (): PackageManager;
  check(userAgent: string): boolean;
}
