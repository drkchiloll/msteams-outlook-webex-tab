/** Global definitions for developement **/

// for style loader
declare module '*.css' {
  const styles: any;
  export = styles;
}

// for json loader
declare module "*.json" {
  const value: any;
  export = value;
}
