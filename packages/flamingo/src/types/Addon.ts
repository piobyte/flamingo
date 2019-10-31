export interface PackageJSON {
  name?: string;
  version?: string;
  main?: string;
  dependencies?: { [name: string]: string };
  devDependencies?: { [name: string]: string };
}

export interface Addon {
  path?: string;
  pkg: PackageJSON;
  hooks?: { [name: string]: any };
}
