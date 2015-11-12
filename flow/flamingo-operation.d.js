declare class FlamingoOperation extends Object{
  request: any;
  profile: function;
  reply: function;

  preprocessorConfig: Object;
  processorConfig: Object;

  reader: function;
  writer: function;

  targetUrl: UrlParse;

  config: Config;
  addons: Object;
  profiles: Object;
}
