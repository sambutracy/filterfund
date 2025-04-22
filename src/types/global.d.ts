interface InjectedAccountWithMeta {
  address: string;
  meta: {
    name: string;
    source: string;
  };
}

interface InjectedExtension {
  enable: (dappName: string) => Promise<InjectedAccountWithMeta[]>;
  name: string;
  version: string;
}

interface Window {
  injectedWeb3?: {
    [name: string]: {
      enable: (dappName: string) => Promise<string[]>;
      version: string;
    };
  };
}